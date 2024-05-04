import { useContract, useContractWrite } from '@starknet-react/core'
import { Entity, Permission } from '@influenceth/sdk'
import dispatcherAbi from '../abis/influence-dispatcher.json'
import swayAbi from '../abis/sway.json'
import { env } from '@/env'
import { overfuelerContract } from '@/lib/contracts'

const overfuelerAddress = env.NEXT_PUBLIC_REFUELER_CONTRACT_ADDRESS
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
      overfuelerContract.populateTransaction.refuel_ship(
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
