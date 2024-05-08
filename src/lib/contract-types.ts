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
}

export type FloodgateContractCrew = Awaited<
  ReturnType<typeof floodgateContract.get_crews>
>[0]

export type FloodgateServiceType = 'RefuelShip' | 'TransportGoods'

export type FloodgateService = Omit<
  FloodgateCrew['services'][0],
  'service_type'
> & {
  serviceType: FloodgateServiceType
}
