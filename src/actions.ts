'use server'

import * as R from 'remeda'
import { Entity } from '@influenceth/sdk'
import { Inventory, ShipType } from '@influenceth/sdk'
import { InfluenceEntity } from 'influence-typed-sdk/api'
import { shortString } from 'starknet'
import { floodgateContract } from './lib/contracts'
import { FloodgateCrew, FloodgateServiceType } from './lib/contract-types'
import { getCrewBonuses } from './lib/utils'
import { influenceApi } from '@/lib/influence-api'

export const getCrew = async (crewId: number) => {
  const [crew, crewmates] = await Promise.all([
    influenceApi.entity({
      id: crewId,
      label: Entity.IDS.CREW,
    }),
    influenceApi.entities({
      match: {
        path: 'Control.controller.id',
        value: crewId,
      },
      label: Entity.IDS.CREWMATE,
    }),
  ])

  return { crew, crewmates }
}

export const getBuilding = async (buildingId: number) =>
  influenceApi.entity({
    id: buildingId,
    label: Entity.IDS.BUILDING,
  })

export type Warehouse = {
  id: number
  name: string
  lotIndex: number
  fuelAmount: number
  owningCrewId: number
}

export const getWarehouses = async (
  address: string,
  asteroidId: number
): Promise<Warehouse[]> => {
  const warehouses = await influenceApi.util.warehouses(address, asteroidId)
  return warehouses
    .map((wh) => ({
      id: wh.id,
      name: wh.Name ?? `Warehouse#${wh.id}`,
      lotIndex: wh.Location?.locations?.lot?.lotIndex ?? 0,
      owningCrewId: wh.Control?.controller?.id ?? 0,
      fuelAmount:
        wh.Inventories.find(
          (i) => i.inventoryType === Inventory.IDS.WAREHOUSE_PRIMARY
        )?.contents?.find((c) => c.product.i === 170)?.amount ?? 0,
    }))
    .filter((wh) => wh.fuelAmount > 0)
}

export type Ship = {
  id: number
  name: string
  type: ShipType
  fuelAmount: number
  fuelCapacity: number
  lotIndex: number
  owningCrewId: number
}

const getFuelCapacity = (ship: ShipType) =>
  Inventory.getType(ship.propellantInventoryType).massConstraint / 1_000

const getFuelAmount = (ship: InfluenceEntity) => {
  const propellantInventory = ship.Inventories.find(
    (inv) => inv.inventoryType === ship.Ship?.shipType.propellantInventoryType
  )

  const fuel =
    propellantInventory?.contents?.find((c) => c.product.i === 170)?.amount ?? 0
  // Reserved mass is in grams for some reason, we want it in kg
  const incomingFuel = (propellantInventory?.reservedMass ?? 0) / 1_000

  return fuel + incomingFuel
}

export const getShips = async (
  address: string,
  asteroidId: number
): Promise<Ship[]> => {
  const ships = await influenceApi.util.ships(address, asteroidId)

  return ships.flatMap((ship) => {
    const lotIndex = ship.Location?.locations?.lot?.lotIndex
    return ship.Ship && lotIndex
      ? [
          {
            id: ship.id,
            name: ship.Name ?? `Ship#${ship.id}`,
            type: ship.Ship?.shipType,
            fuelAmount: getFuelAmount(ship),
            fuelCapacity: getFuelCapacity(ship.Ship.shipType),
            owningCrewId: ship.Control?.controller?.id ?? 0,
            lotIndex,
          },
        ]
      : []
  })
}

export type GetCrewArgs = {
  includeLocked?: boolean
  manager?: string
}

export const getRegisteredCrews = async (manager?: string) =>
  floodgateContract.get_crews(manager ?? '0x0')

export const getFloodgateCrews = async (
  args?: GetCrewArgs
): Promise<FloodgateCrew[]> => {
  const registeredCrews = await getRegisteredCrews(args?.manager)

  const apiCrews = await influenceApi.entities({
    id: registeredCrews.map(({ crew_id }) => Number(crew_id)),
    label: Entity.IDS.CREW,
  })
  const crewmateIds = apiCrews.flatMap((c) => c.Crew?.roster ?? [])

  const [asteroidNames, stations, allCrewmates] = await Promise.all([
    influenceApi.util.asteroidNames(
      R.pipe(
        R.map(apiCrews, (c) => c.Location?.locations?.asteroid?.id),
        R.filter(R.isTruthy)
      )
    ),
    influenceApi.entities({
      id: R.pipe(
        R.map(apiCrews, (c) => c.Location?.locations?.building?.id),
        R.filter(R.isTruthy),
        R.unique()
      ),
      label: Entity.IDS.BUILDING,
    }),
    influenceApi.entities({
      id: crewmateIds,
      label: Entity.IDS.CREWMATE,
    }),
  ])

  return R.pipe(
    R.map(registeredCrews, (registeredCrew) => {
      const crew = apiCrews.find((c) => c.id === Number(registeredCrew.crew_id))
      if (!crew) return

      const station = stations.find(
        (s) => s.id === crew.Location?.locations?.building?.id
      )
      if (!station) return

      const asteroidId = crew.Location?.locations?.asteroid?.id ?? 1
      const asteroidName = asteroidNames.get(asteroidId) ?? ''
      const crewmates = allCrewmates.filter((c) =>
        crew.Crew?.roster?.includes(c.id)
      )

      return {
        id: Number(registeredCrew.crew_id),
        locked: registeredCrew.is_locked,
        managerAddress: BigInt(registeredCrew.manager_address),
        name: crew.Name ?? `Crew#${registeredCrew.crew_id}`,
        asteroidId,
        asteroidName,
        stationName: station.Name ?? `Station#${station.id}`,
        crewmateIds: crew.Crew?.roster ?? [],
        services: registeredCrew.services.map((service) => ({
          enabled: service.is_enabled,
          actionSwayFee: BigInt(service.sway_fee_per_action),
          secondsSwayFee: BigInt(service.sway_fee_per_second),
          serviceType: shortString.decodeShortString(
            service.service_type?.toString()
          ) as FloodgateServiceType,
        })),
        bonuses: getCrewBonuses(crew, crewmates, station),
      }
    }),
    R.filter(R.isTruthy)
  )
}
