import { Contract, RpcProvider } from 'starknet'
import * as R from 'remeda'
import { AbilityBonusDetails, Crew, Crewmate, Entity } from '@influenceth/sdk'
import { influenceApi } from './influence-api'
import { env } from '@/env'

const provider = new RpcProvider({
  nodeUrl: 'https://free-rpc.nethermind.io/sepolia-juno/',
})

const getContract = async () => {
  const { abi } = await provider.getClassAt(
    env.NEXT_PUBLIC_REFUELER_CONTRACT_ADDRESS
  )
  return new Contract(abi, env.NEXT_PUBLIC_REFUELER_CONTRACT_ADDRESS, provider)
}

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

const getContractCrewData = async () => {
  const contract = await getContract()

  const [swayFee, crewId] = await Promise.all([
    contract.call('get_sway_fee'),
    contract.call('get_crew_id'),
  ])

  return [{ id: Number(crewId), swayFee: BigInt(Number(swayFee)) }]
}

export const getContractCrews = async (): Promise<ContractCrew[]> => {
  const contractCrewData = await getContractCrewData()
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
      const getBonus = (abilityId: number) =>
        Crew.getAbilityBonus(
          abilityId,
          crewmates,
          {
            population: station.Station?.population ?? 0,
            stationType: station.Station?.stationType.i ?? 0,
          },
          ((new Date().getTime() - (crew?.Crew?.lastFed?.getTime() ?? 0)) /
            1000) *
            24
        )

      return {
        id: id,
        name: crew.Name ?? `Crew#${id}`,
        asteroidId,
        asteroidName,
        crewmateIds: crew.Crew?.roster ?? [],
        swayFee,
        bonuses: {
          transportTime: getBonus(Crewmate.ABILITY_IDS.HOPPER_TRANSPORT_TIME),
          massCapacity: getBonus(Crewmate.ABILITY_IDS.INVENTORY_MASS_CAPACITY),
          volumeCapacity: getBonus(
            Crewmate.ABILITY_IDS.INVENTORY_VOLUME_CAPACITY
          ),
        },
      }
    }),
    R.filter(R.isTruthy)
  )
}
