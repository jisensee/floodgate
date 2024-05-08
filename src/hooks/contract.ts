import { useContract, useContractWrite } from '@starknet-react/core'
import { Entity, Permission } from '@influenceth/sdk'
import dispatcherAbi from '../abis/influence-dispatcher.json'
import swayAbi from '../abis/sway.json'
import { env } from '@/env'
import { floodgateContract } from '@/lib/contracts'
import { FloodgateService } from '@/lib/contract-types'

const overfuelerAddress = env.NEXT_PUBLIC_FLOODGATE_CONTRACT_ADDRESS
const dispatcherAddress = env.NEXT_PUBLIC_INFLUENCE_DISPATCHER_CONTRACT_ADDRESS

export const useFuelShipTransaction = (args: {
  warehouseId: number
  shipId: number
  contractCrewId: number
  warehouseOwnerCrewId: number
  shipOwnerCrewId: number
  swayFee: bigint
  fuelAmount: number
}) => {
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
      floodgateContract.populateTransaction.service_refuel_ship(
        args.contractCrewId,
        {
          inventory_id: args.warehouseId,
          inventory_type: Entity.IDS.BUILDING,
          inventory_slot: 2,
        },
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

export const useRegisterCrew = (crewId: number, manager: string) => {
  const { contract: dispatcherContract } = useContract({
    abi: dispatcherAbi,
    address: dispatcherAddress,
  })

  return useContractWrite({
    calls: [
      dispatcherContract?.populateTransaction?.['run_system']?.(
        'DelegateCrew',
        [env.NEXT_PUBLIC_FLOODGATE_CONTRACT_ADDRESS, Entity.IDS.CREW, crewId]
      ),
      floodgateContract.populateTransaction.register_crew(crewId, manager),
    ],
  })
}
export const useSetCrewServicesConfig = (
  crewId: number,
  services: FloodgateService[]
) =>
  useContractWrite({
    calls: [
      floodgateContract.populateTransaction.set_crew_services_configuration(
        crewId,
        services.map((service) => ({
          sway_fee_per_action: service.actionSwayFee,
          sway_fee_per_second: service.secondsSwayFee,
          is_enabled: service.enabled,
          service_type: service.serviceType,
        }))
      ),
    ],
  })

export const useUnregisterCrew = (crewId: number) =>
  useContractWrite({
    calls: [floodgateContract.populateTransaction.unregister_crew(crewId)],
  })

export const useSetCrewLocked = (crewId: number, isLocked: boolean) =>
  useContractWrite({
    calls: [
      floodgateContract.populateTransaction.set_crew_locked_status(
        crewId,
        isLocked
      ),
    ],
  })

export const useSetCrewManager = (crewId: number, managerAddress: string) =>
  useContractWrite({
    calls: [
      floodgateContract.populateTransaction.transfer_crew_management(
        crewId,
        managerAddress
      ),
    ],
  })
