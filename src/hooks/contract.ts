import {
  useContract,
  useContractRead,
  useContractWrite,
} from '@starknet-react/core'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Crew, Crewmate, Entity, Permission } from '@influenceth/sdk'
import overfuelerAbi from '../../abis/overfueler.json'
import dispatcherAbi from '../../abis/influence-dispatcher.json'
import swayAbi from '../../abis/sway.json'
import { getBuilding, getCrew } from '@/actions'
import { env } from '@/env'

const overfuelerAddress = env.NEXT_PUBLIC_REFUELER_CONTRACT_ADDRESS
const dispatcherAddress = env.NEXT_PUBLIC_INFLUENCE_DISPATCHER_CONTRACT_ADDRESS

export const useContractCrew = () => {
  const { data: crewId, isLoading: crewIdLoading } = useContractRead({
    abi: overfuelerAbi,
    functionName: 'get_crew_id',
    address: overfuelerAddress,
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

export const useFuelShipTransaction = (args: {
  warehouseId: number
  shipId: number
  contractCrewId: number
  warehouseOwnerCrewId: number
  shipOwnerCrewId: number
  swayFee: bigint
  fuelAmount: number
}) => {
  const { contract: overfuelerContract } = useContract({
    abi: overfuelerAbi,
    address: overfuelerAddress,
  })
  const { contract: dispatcherContract } = useContract({
    abi: dispatcherAbi,
    address: dispatcherAddress,
  })
  const { contract: swayContract } = useContract({
    abi: swayAbi,
    address: env.NEXT_PUBLIC_SWAY_CONTRACT_ADDRESS,
  })

  const write = useContractWrite({
    calls: [
      dispatcherContract?.populateTransaction?.['run_system']?.('Whitelist', [
        Entity.IDS.BUILDING,
        args.warehouseId,
        Permission.IDS.REMOVE_PRODUCTS,
        Entity.IDS.CREW,
        args.contractCrewId,
        Entity.IDS.CREW,
        args.warehouseOwnerCrewId,
      ]),
      dispatcherContract?.populateTransaction?.['run_system']?.('Whitelist', [
        Entity.IDS.SHIP,
        args.shipId,
        Permission.IDS.ADD_PRODUCTS,
        Entity.IDS.CREW,
        args.contractCrewId,
        Entity.IDS.CREW,
        args.shipOwnerCrewId,
      ]),
      swayContract?.populateTransaction?.['increase_allowance']?.(
        overfuelerAddress,
        args.swayFee
      ),
      overfuelerContract?.populateTransaction?.['refuel_ship']?.(
        Entity.IDS.BUILDING,
        args.warehouseId,
        2,
        args.shipId,
        args.fuelAmount
      ),
      dispatcherContract?.populateTransaction?.['run_system']?.(
        'RemoveFromWhitelist',
        [
          Entity.IDS.BUILDING,
          args.warehouseId,
          Permission.IDS.REMOVE_PRODUCTS,
          Entity.IDS.CREW,
          args.contractCrewId,
          Entity.IDS.CREW,
          args.warehouseOwnerCrewId,
        ]
      ),
      dispatcherContract?.populateTransaction?.['run_system']?.(
        'RemoveFromWhitelist',
        [
          Entity.IDS.SHIP,
          args.shipId,
          Permission.IDS.ADD_PRODUCTS,
          Entity.IDS.CREW,
          args.contractCrewId,
          Entity.IDS.CREW,
          args.shipOwnerCrewId,
        ]
      ),
    ],
  })

  return write
}

export const useSwayFee = () => {
  const { data } = useContractRead({
    abi: overfuelerAbi,
    functionName: 'get_sway_fee',
    address: overfuelerAddress,
  })

  return data ? BigInt(data.toString()) : undefined
}
