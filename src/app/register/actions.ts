'use server'

import { Address, Entity } from '@influenceth/sdk'
import { A, O, pipe } from '@mobily/ts-belt'
import { InfluenceEntity, getEntityName } from 'influence-typed-sdk/api'
import { influenceApi } from '@/lib/influence-api'
import { getCrewMetadata } from '@/actions'
import { CrewBonuses, getCrewBonuses, getFoodRatio } from '@/lib/utils'

export const getAccountCrews = async (
  address: string
): Promise<
  (InfluenceEntity & {
    name: string
    crewmateIds: number[]
    asteroidId: number
    asteroidName: string
    currentFoodRatio: number
    stationName?: string
    ownerAddress: bigint
    bonuses: CrewBonuses
  })[]
> => {
  const crews = await influenceApi.entities({
    match: {
      path: 'Nft.owners.starknet',
      value: Address.toStandard(address),
    },
    label: Entity.IDS.CREW,
  })
  if (crews.length === 0) return []
  const { asteroidNames, stations, crewmates } = await getCrewMetadata(crews)

  return pipe(
    crews,
    A.filterMap((crew) =>
      pipe(
        O.fromNullable(
          stations.find((s) =>
            [
              crew.Location?.resolvedLocation?.building?.id,
              crew.Location?.resolvedLocation.ship?.id,
            ].includes(s.id)
          )
        ),
        O.map((station) => [crew, station] as const)
      )
    ),
    A.map(([crew, station]) => ({
      ...crew,
      name: getEntityName(crew),
      crewmateIds: crew.Crew?.roster ?? [],
      asteroidId: crew.Location?.resolvedLocations?.asteroid?.id ?? 0,
      asteroidName:
        asteroidNames.get(
          crew.Location?.resolvedLocations?.asteroid?.id ?? 0
        ) ?? '',
      stationName: getEntityName(station),
      currentFoodRatio: getFoodRatio(crew, crewmates, station),
      ownerAddress: BigInt(crew.Nft?.owner ?? 0),
      bonuses: getCrewBonuses(
        crew,
        crewmates.filter((c) => crew.Crew?.roster.includes(c.id)),
        station
      ),
    }))
  )
}
