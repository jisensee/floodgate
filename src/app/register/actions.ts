'use server'

import { Address, Entity } from '@influenceth/sdk'
import { A, O, pipe } from '@mobily/ts-belt'
import { influenceApi } from '@/lib/influence-api'
import { getCrewMetadata } from '@/actions'
import { getCrewBonuses } from '@/lib/utils'

export const getAccountCrews = async (address: string) => {
  const crews = await influenceApi.entities({
    match: {
      path: 'Nft.owners.starknet',
      value: Address.toStandard(address),
    },
    label: Entity.IDS.CREW,
  })
  const { asteroidNames, stations, crewmates } = await getCrewMetadata(crews)

  return pipe(
    crews,
    A.filterMap((crew) =>
      pipe(
        O.fromNullable(
          stations.find((s) =>
            [
              crew.Location?.location?.building?.id,
              crew.Location?.location.ship?.id,
            ].includes(s.id)
          )
        ),
        O.map((station) => [crew, station] as const)
      )
    ),
    A.map(([crew, station]) => ({
      ...crew,
      name: crew.Name ?? `Crew#${crew.id}`,
      crewmateIds: crew.Crew?.roster ?? [],
      asteroidId: crew.Location?.locations?.asteroid?.id ?? 0,
      asteroidName:
        asteroidNames.get(crew.Location?.locations?.asteroid?.id ?? 0) ?? '',
      stationName: station.Name,
      bonuses: getCrewBonuses(
        crew,
        crewmates.filter((c) => crew.Crew?.roster.includes(c.id)),
        station
      ),
    }))
  )
}
