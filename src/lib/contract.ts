import * as R from 'remeda'
import { AbilityBonusDetails, Entity } from '@influenceth/sdk'
import { influenceApi } from './influence-api'
import { overfuelerContract } from './contracts'
import { getCrewBonuses } from './utils'

export type ContractCrew = {
  id: number
  name: string
  asteroidId: number
  asteroidName: string
  crewmateIds: number[]
  swayFee: bigint
  bonuses: {
    transportTime: AbilityBonusDetails
    massCapacity: AbilityBonusDetails
    volumeCapacity: AbilityBonusDetails
  }
}

export const getRegisteredCrews = async () => {
  const [swayFee, crewId] = await Promise.all([
    overfuelerContract.get_sway_fee(),
    overfuelerContract.get_crew_id(),
  ])

  return [{ id: Number(crewId), swayFee: BigInt(Number(swayFee)) }]
}

export const getContractCrews = async (): Promise<ContractCrew[]> => {
  const contractCrewData = await getRegisteredCrews()
  const apiCrews = await influenceApi.entities({
    id: contractCrewData.map(({ id }) => id),
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
    R.map(contractCrewData, ({ id, swayFee }) => {
      const crew = apiCrews.find((c) => c.id === id)
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
        id: id,
        name: crew.Name ?? `Crew#${id}`,
        asteroidId,
        asteroidName,
        crewmateIds: crew.Crew?.roster ?? [],
        swayFee,
        bonuses: getCrewBonuses(crew, crewmates, station),
      }
    }),
    R.filter(R.isTruthy)
  )
}
