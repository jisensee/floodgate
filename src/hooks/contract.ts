import {
  useContract,
  useContractRead,
  useContractWrite,
} from '@starknet-react/core'
import { Call, cairo } from 'starknet'
import { Entity, Permission } from '@influenceth/sdk'
import { ProductAmount } from 'influence-typed-sdk/api'
import { ABI as floodgateAbi } from '../abis/floodgate'
import dispatcherAbi from '../abis/influence-dispatcher.json'
import swayAbi from '../abis/sway.json'
import { env } from '@/env'
import { floodgateContract } from '@/lib/contracts'
import { FloodgateService } from '@/lib/contract-types'

const overfuelerAddress = env.NEXT_PUBLIC_FLOODGATE_CONTRACT_ADDRESS
const dispatcherAddress = env.NEXT_PUBLIC_INFLUENCE_DISPATCHER_CONTRACT_ADDRESS

const addFeedingCall = (
  calls: Call[],
  crewId: number,
  autoFeedingAmount: number
) =>
  autoFeedingAmount > 0
    ? [
        floodgateContract.populateTransaction.resupply_food_from_default(
          crewId,
          autoFeedingAmount
        ),
        ...calls,
      ]
    : calls

export const useFuelShipTransaction = (args: {
  warehouseId: number
  shipId: number
  contractCrewId: number
  warehouseOwnerCrewId: number
  shipOwnerCrewId: number
  swayFee: bigint
  fuelAmount: number
  autoFeedingAmount: number
}) => {
  const { contract: dispatcherContract } = useContract({
    abi: dispatcherAbi,
    address: dispatcherAddress,
  })
  const { contract: swayContract } = useContract({
    abi: swayAbi,
    address: env.NEXT_PUBLIC_SWAY_CONTRACT_ADDRESS,
  })

  const refuelCalls: Call[] = [
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
  ]

  const write = useContractWrite({
    calls: addFeedingCall(
      refuelCalls,
      args.contractCrewId,
      args.autoFeedingAmount
    ),
  })

  return write
}
const useInfluenceDispatcher = () =>
  useContract({
    abi: dispatcherAbi,
    address: dispatcherAddress,
  }).contract

const useDelegateCrewCall = (crewId: number, targetAddress: string) => {
  const influenceDispatcher = useInfluenceDispatcher()

  return influenceDispatcher?.populateTransaction?.['run_system']?.(
    'DelegateCrew',
    [targetAddress, Entity.IDS.CREW, crewId]
  )
}

export const useRegisterCrew = (crewId: number, manager: string) => {
  const delegateCrewCall = useDelegateCrewCall(
    crewId,
    env.NEXT_PUBLIC_FLOODGATE_CONTRACT_ADDRESS
  )

  return useContractWrite({
    calls: [
      delegateCrewCall,
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

export const useUnregisterCrew = (crewId: number, delegateBackTo?: string) => {
  const delegateCrewCall = useDelegateCrewCall(crewId, delegateBackTo ?? '0x0')

  return useContractWrite({
    calls: [
      ...(delegateBackTo ? [delegateCrewCall] : []),
      floodgateContract.populateTransaction.unregister_crew(crewId),
    ],
  })
}

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

export const useFeeBalance = (address: string) => {
  const { data } = useContractRead({
    abi: [...floodgateAbi],
    watch: true,
    address: env.NEXT_PUBLIC_FLOODGATE_CONTRACT_ADDRESS,
    functionName: 'get_current_balance',
    args: [address],
  })

  return data ? BigInt(data.toString()) : undefined
}

export const useWithdrawFees = (amount: bigint) =>
  useContractWrite({
    calls: [floodgateContract.populateTransaction.withdraw_balance(amount)],
  })

export const useDevteamShare = () => {
  const { data } = useContractRead({
    abi: [...floodgateAbi],
    address: env.NEXT_PUBLIC_FLOODGATE_CONTRACT_ADDRESS,
    functionName: 'get_devteam_share',
  })
  return data ? Number(data.toString()) / 1_000 : undefined
}

export const useSetFeedingConfig = (
  crewId: number,
  enabled: boolean,
  warehouseId: number
) =>
  useContractWrite({
    calls: [
      floodgateContract.populateTransaction.set_crew_feeding_configuration(
        crewId,
        enabled,
        {
          inventory_id: warehouseId,
          inventory_type: Entity.IDS.BUILDING,
          inventory_slot: 2,
        }
      ),
    ],
  })

export const useFeedCrew = (
  crewId: number,
  warehouseId: number,
  foodAmount: number
) =>
  useContractWrite({
    calls: [
      floodgateContract.populateTransaction.resupply_food(
        crewId,
        {
          inventory_type: Entity.IDS.BUILDING,
          inventory_slot: 2,
          inventory_id: warehouseId,
        },
        foodAmount
      ),
    ],
  })

export type TransferGoodsInventory = {
  inventoryId: number
  inventoryType: number
  inventorySlot: number
  owningCrewId: number
}
export const useTransferGoodsTransaction = (
  crewId: number,
  actionFee: bigint,
  destination: TransferGoodsInventory,
  transfers: {
    source: TransferGoodsInventory
    contents: ProductAmount[]
  }[],
  autoFeedingAmount: number
) => {
  const { contract: dispatcherContract } = useContract({
    abi: dispatcherAbi,
    address: dispatcherAddress,
  })
  const { contract: swayContract } = useContract({
    abi: swayAbi,
    address: env.NEXT_PUBLIC_SWAY_CONTRACT_ADDRESS,
  })

  const transferCall =
    floodgateContract.populateTransaction.service_transfer_goods(
      crewId,
      {
        inventory_id: destination.inventoryId,
        inventory_type: destination.inventoryType,
        inventory_slot: destination.inventorySlot,
      },
      //@ts-expect-error abi wan doesn't like tuples I guess
      transfers.map(({ source, contents }) =>
        cairo.tuple(
          {
            inventory_id: source.inventoryId,
            inventory_type: source.inventoryType,
            inventory_slot: source.inventorySlot,
          },
          contents.map((c) => ({
            item_id: c.product.i,
            item_quantity: c.amount,
          }))
        )
      )
    )

  const whitelistCalls = transfers
    .map(({ source }) =>
      dispatcherContract?.populateTransaction?.['run_system']?.('Whitelist', [
        source.inventoryType,
        source.inventoryId,
        Permission.IDS.REMOVE_PRODUCTS,
        Entity.IDS.CREW,
        crewId,
        Entity.IDS.CREW,
        source.owningCrewId,
      ])
    )
    .concat([
      dispatcherContract?.populateTransaction?.['run_system']?.('Whitelist', [
        destination.inventoryType,
        destination.inventoryId,
        Permission.IDS.ADD_PRODUCTS,
        Entity.IDS.CREW,
        crewId,
        Entity.IDS.CREW,
        destination.owningCrewId,
      ]),
    ])
  const removeFromWhitelistCalls = transfers
    .flatMap(({ source }) => [
      dispatcherContract?.populateTransaction?.['run_system']?.(
        'RemoveFromWhitelist',
        [
          source.inventoryType,
          source.inventoryId,
          Permission.IDS.REMOVE_PRODUCTS,
          Entity.IDS.CREW,
          crewId,
          Entity.IDS.CREW,
          source.owningCrewId,
        ]
      ),
    ])
    .concat([
      dispatcherContract?.populateTransaction?.['run_system']?.(
        'RemoveFromWhitelist',
        [
          destination.inventoryType,
          destination.inventoryId,
          Permission.IDS.ADD_PRODUCTS,
          Entity.IDS.CREW,
          crewId,
          Entity.IDS.CREW,
          destination.owningCrewId,
        ]
      ),
    ])

  return useContractWrite({
    calls: addFeedingCall(
      [
        ...whitelistCalls,
        swayContract?.populateTransaction?.['increase_allowance']?.(
          overfuelerAddress,
          actionFee
        ),
        transferCall,
        ...removeFromWhitelistCalls,
      ],
      crewId,
      autoFeedingAmount
    ),
  })
}
