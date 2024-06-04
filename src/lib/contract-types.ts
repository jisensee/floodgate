import { AbilityBonusDetails } from '@influenceth/sdk'
import { floodgateContract } from './contracts'

export type FloodgateCrew = {
  id: number
  locked: boolean
  name: string
  asteroidId: number
  asteroidName: string
  stationName: string
  crewmateIds: number[]
  managerAddress: bigint
  ownerAddress: bigint
  feedingConfig: {
    automaticFeedingEnabled: boolean
    inventoryId: number
    inventoryType: number
    inventorySlot: number
  }
  services: {
    enabled: boolean
    actionSwayFee: bigint
    secondsSwayFee: bigint
    serviceType: FloodgateServiceType
  }[]
  bonuses: {
    transportTime: AbilityBonusDetails
    massCapacity: AbilityBonusDetails
    volumeCapacity: AbilityBonusDetails
  }
  currentFoodRatio: number
}

export type FloodgateContractCrew = Awaited<
  ReturnType<typeof floodgateContract.get_crew>
>

export const floodGateServiceTypes = ['RefuelShip', 'TransferGoods'] as const
export type FloodgateServiceType = (typeof floodGateServiceTypes)[number]

export type FloodgateService = Omit<
  FloodgateCrew['services'][0],
  'service_type'
> & {
  serviceType: FloodgateServiceType
}
