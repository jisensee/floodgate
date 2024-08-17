'use server'

import { isFuture } from 'date-fns'
import { Entity, Lot} from '@influenceth/sdk'
import { InfluenceEntity, getEntityName } from 'influence-typed-sdk/api'
import { shortString } from 'starknet'
import { A, F, G, O, pipe } from '@mobily/ts-belt'
import { floodgateContract } from '@/lib/contracts'
import {
  FloodgateContractCrew,
  FloodgateCrew,
  FloodgateServiceType,
} from '@/lib/contract-types'
import { getCrewBonuses, getFoodRatio, getFoodAmount } from '@/lib/utils'
import { env } from '@/env'
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

export const getBuildingAtLot = async (asteroidId: number, lotIndex: number) =>
  influenceApi
    .entities({
      match: {
        path: 'Location.locations.uuid',
        value: Entity.packEntity({
          id: Lot.toId(asteroidId, lotIndex),
          label: Entity.IDS.LOT,
        }),
      },
      label: Entity.IDS.BUILDING,
    })
    .then(A.head)

export type EntityType = {
  type: number
  name: string
}

export type GetCrewArgs = {
  includeLocked?: boolean
  manager?: string
}

export const getRegisteredCrews = async (manager?: string) => {
  const contractLocked = await floodgateContract.is_locked()

  return contractLocked ? [] : floodgateContract.get_crews(manager ?? '0x0')
}

export const getFloodgateCrews = async (args?: GetCrewArgs) => {
  const registeredCrews = await getRegisteredCrews(args?.manager).then(
    (crews) => crews.filter((crew) => !crew.is_locked || args?.includeLocked)
  )

  if (registeredCrews.length === 0) return []

  const apiCrews = (
    await influenceApi.entities({
      id: registeredCrews.map(({ crew_id }) => Number(crew_id)),
      label: Entity.IDS.CREW,
    })
  ).filter(
    (crew) =>
      crew.Crew?.delegatedTo === env.NEXT_PUBLIC_FLOODGATE_CONTRACT_ADDRESS
  )

  if (apiCrews.length === 0) return []

  const {
    asteroidNames,
    stations,
    crewmates: allCrewmates,
  } = await getCrewMetadata(apiCrews)

  return pipe(
    registeredCrews,
    A.map((registeredCrew) => {
      const crew = apiCrews.find((c) => c.id === Number(registeredCrew.crew_id))
      if (!crew) return

      const station = stations.find(
        (s) => s.id === crew.Location?.resolvedLocations?.building?.id
      )
      if (!station) return

      const asteroidId = crew.Location?.resolvedLocations?.asteroid?.id ?? 1
      const asteroidName = asteroidNames.get(asteroidId) ?? ''
      const crewmates = allCrewmates.filter((c) =>
        crew.Crew?.roster?.includes(c.id)
      )

      return makeFloodgateCrew(
        registeredCrew,
        crew,
        crewmates,
        station,
        asteroidName
      )
    }),
    A.filter(G.isNotNullable)
  )
}

export const getFloodgateCrew = async (crewId: number) => {
  const [registeredCrew, apiCrew] = await Promise.all([
    floodgateContract.get_crew(crewId),
    influenceApi.entity({
      id: crewId,
      label: Entity.IDS.CREW,
    }),
  ])
  if (
    !apiCrew ||
    apiCrew.Crew?.delegatedTo !== env.NEXT_PUBLIC_FLOODGATE_CONTRACT_ADDRESS
  )
    return

  const { asteroidNames, stations, crewmates } = await getCrewMetadata([
    apiCrew,
  ])
  const asteroidName =
    asteroidNames.get(apiCrew.Location?.resolvedLocations?.asteroid?.id ?? 1) ??
    ''
  const station = stations[0]
  if (!station) return
  return makeFloodgateCrew(
    registeredCrew,
    apiCrew,
    crewmates,
    station,
    asteroidName
  )
}

export const getCrewMetadata = async (apiCrews: InfluenceEntity[]) => {
  const [asteroidNames, shipStations, buildingStations, crewmates] =
    await Promise.all([
      influenceApi.util.asteroidNames(
        pipe(
          apiCrews,
          A.map((c) => c.Location?.resolvedLocations?.asteroid?.id),
          A.filter(G.isNotNullable)
        )
      ),
      pipe(
        apiCrews,
        A.filterMap((c) => c.Location?.resolvedLocation?.ship?.id),
        F.ifElse(
          A.isNotEmpty,
          (shipIds) =>
            influenceApi.entities({
              id: shipIds,
              label: Entity.IDS.SHIP,
            }),
          () => Promise.resolve([])
        )
      ),
      pipe(
        apiCrews,
        A.filterMap((c) => c.Location?.resolvedLocation?.building?.id),
        F.ifElse(
          A.isNotEmpty,
          (shipIds) =>
            influenceApi.entities({
              id: shipIds,
              label: Entity.IDS.BUILDING,
            }),
          () => Promise.resolve([])
        )
      ),
      influenceApi.entities({
        id: apiCrews.flatMap((c) => c.Crew?.roster ?? []),
        label: Entity.IDS.CREWMATE,
      }),
    ])

  return {
    asteroidNames,
    stations: A.concat(shipStations, buildingStations),
    crewmates,
  }
}

const makeFloodgateCrew = (
  registeredCrew: FloodgateContractCrew,
  apiCrew: InfluenceEntity,
  crewmates: InfluenceEntity[],
  station: InfluenceEntity,
  asteroidName: string
): FloodgateCrew => ({
  id: Number(registeredCrew.crew_id),
  locked: registeredCrew.is_locked,
  managerAddress: BigInt(registeredCrew.manager_address),
  ownerAddress: BigInt(apiCrew?.Nft?.owner ?? 0),
  name: getEntityName(apiCrew),
  asteroidId: apiCrew.Location?.resolvedLocations?.asteroid?.id ?? 1,
  asteroidName,
  stationName: getEntityName(station),
  busyUntil: O.filter(apiCrew.Crew?.readyAtTimestamp, isFuture) ?? undefined,
  crewmateIds: apiCrew.Crew?.roster ?? [],
  feedingConfig: {
    automaticFeedingEnabled: registeredCrew.is_automated_feeding_enabled,
    inventoryId: Number(registeredCrew.default_feeding_inventory.inventory_id),
    inventoryType: Number(
      registeredCrew.default_feeding_inventory.inventory_type
    ),
    inventorySlot: Number(
      registeredCrew.default_feeding_inventory.inventory_slot
    ),
  },
  services: registeredCrew.services.map((service) => ({
    enabled: service.is_enabled,
    actionSwayFee: BigInt(service.sway_fee_per_action),
    secondsSwayFee: BigInt(service.sway_fee_per_second),
    serviceType: shortString.decodeShortString(
      service.service_type?.toString()
    ) as FloodgateServiceType,
  })),
  bonuses: getCrewBonuses(apiCrew, crewmates, station),
  currentFoodRatio: getFoodRatio(apiCrew, crewmates, station),
})

export const getAutomaticFeedingAmount = async (crew: FloodgateCrew) => {
  if (!crew.feedingConfig.automaticFeedingEnabled) {
    return 0
  }

  const foodRatio = crew.currentFoodRatio
  if (foodRatio >= 0.6) {
    return 0
  }

  const foodInventory = await getBuilding(crew.feedingConfig.inventoryId)
  if (!foodInventory) {
    return 0
  }

  const availableFood = getFoodAmount(foodInventory)
  const foodToMax = (1 - crew.currentFoodRatio) * crew.crewmateIds.length * 1000

  return Math.floor(Math.min(foodToMax, availableFood))
}
