import {
  useContract,
  useContractRead,
  useContractWrite,
} from '@starknet-react/core'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Crew, Crewmate } from '@influenceth/sdk'
import abi from '../../abi.json'
import { getBuilding, getCrew } from '@/actions'
import { env } from '@/env'

const contractAddress = env.NEXT_PUBLIC_CONTRACT_ADDRESS

export const useContractCrew = () => {
  const { data: crewId, isLoading: crewIdLoading } = useContractRead({
    abi: abi,
    functionName: 'get_crew_id',
    address: contractAddress,
  })
  const { data: crewData, isLoading: crewDataLoading } = useQuery({
    queryKey: ['contract-crew-id'],
    queryFn: () => getCrew(Number(crewId) ?? 0),
    enabled: !!crewId,
  })

  const stationId = crewData?.crew.Location?.locations?.building?.id
  const { data: station } = useQuery({
    queryKey: ['crew-station', stationId],
    queryFn: () => getBuilding(stationId ?? 0),
    enabled: !!stationId,
  })

  const bonuses = useMemo(() => {
    if (!station || !station.Station || !crewData) {
      return
    }
    const getBonus = (abilityId: number) =>
      Crew.getAbilityBonus(
        abilityId,
        crewData.crewmates,
        {
          population: station.Station?.population ?? 0,
          stationType: station.Station?.stationType.i ?? 0,
        },
        ((new Date().getTime() -
          (crewData.crew?.Crew?.lastFed?.getTime() ?? 0)) /
          1000) *
          24
      )

    return {
      transportTimeBonus: getBonus(Crewmate.ABILITY_IDS.HOPPER_TRANSPORT_TIME),
      volumeBonus: getBonus(Crewmate.ABILITY_IDS.INVENTORY_VOLUME_CAPACITY),
      freeTransportDistanceBonus: getBonus(
        Crewmate.ABILITY_IDS.FREE_TRANSPORT_DISTANCE
      ),
    }
  }, [station, crewData])

  return {
    crewData: crewData && bonuses && { ...crewData, bonuses },
    isLoading: crewIdLoading || crewDataLoading || !bonuses,
  }
}

export type CrewData = ReturnType<typeof useContractCrew>['crewData']

export const useFuelShipTransaction = () => {
  const { contract } = useContract({
    abi: abi,
    address: contractAddress,
  })
  return useContractWrite({
    calls: [contract?.populateTransaction?.['set_crew_id']?.(1)],
  })
}
