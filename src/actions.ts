'use server'

import { Entity } from '@influenceth/sdk'
import { Inventory, ShipType } from '@influenceth/sdk'
import { InfluenceEntity } from 'influence-typed-sdk'
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

export type Warehouse = {
  id: number
  name: string
  lotIndex: number
  fuelAmount: number
}

export const getWarehouses = async (address: string): Promise<Warehouse[]> => {
  const warehouses = await influenceApi.util.warehouses(address, 1)
  return warehouses
    .map((wh) => ({
      id: wh.id,
      name: wh.Name ?? `Warehouse#${wh.id}`,
      lotIndex: wh.Location?.locations?.lot?.lotIndex ?? 0,
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
}

const getFuelCapacity = (ship: ShipType) =>
  Inventory.getType(ship.propellantInventoryType).massConstraint / 1_000

const getFuelAmount = (ship: InfluenceEntity) =>
  ship.Inventories.find(
    (inv) => inv.inventoryType === ship.Ship?.shipType.propellantInventoryType
  )?.contents?.find((c) => c.product.i === 170)?.amount ?? 0

export const getShips = async (address: string): Promise<Ship[]> => {
  const ships = await influenceApi.util.ships(address, 1)

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
            lotIndex,
          },
        ]
      : []
  })
}
