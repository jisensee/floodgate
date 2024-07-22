import { useReadContract, useSendTransaction } from '@starknet-react/core'
import { ArgsOrCalldata, Call, cairo } from 'starknet'
import { Entity, Permission, System } from '@influenceth/sdk'
import { ProductAmount } from 'influence-typed-sdk/api'
import { useMemo } from 'react'
import { A, pipe } from '@mobily/ts-belt'
import { ABI as floodgateAbi } from '../abis/floodgate'
import { env } from '@/env'
import {
  floodgateContract,
  influenceDispatcherContract,
  swayContract,
} from '@/lib/contracts'
import { FloodgateService } from '@/lib/contract-types'

const floodgateContractAddress = env.NEXT_PUBLIC_FLOODGATE_CONTRACT_ADDRESS
const influenceDispatcherAddress =
  env.NEXT_PUBLIC_INFLUENCE_DISPATCHER_CONTRACT_ADDRESS
const swayAddress = env.NEXT_PUBLIC_SWAY_CONTRACT_ADDRESS

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
  inventoryLabel: number
  inventoryId: number
  inventorySlot: number
  shipId: number
  contractCrewId: number
  inventoryOwnerCrewId: number
  shipOwnerCrewId: number
  swayFee: bigint
  fuelAmount: number
  autoFeedingAmount: number
}) => {
  const refuelCalls: Call[] = [
    influenceDispatcherContract?.populateTransaction?.['run_system']?.(
      'Whitelist',
      [
        args.inventoryLabel,
        args.inventoryId,
        Permission.IDS.REMOVE_PRODUCTS,
        Entity.IDS.CREW,
        args.contractCrewId,
        Entity.IDS.CREW,
        args.inventoryOwnerCrewId,
      ]
    ),
    influenceDispatcherContract?.populateTransaction?.['run_system']?.(
      'Whitelist',
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
    swayContract?.populateTransaction?.['increase_allowance']?.(
      floodgateContractAddress,
      args.swayFee
    ),
    floodgateContract.populateTransaction.service_refuel_ship(
      args.contractCrewId,
      {
        inventory_id: args.inventoryId,
        inventory_type: args.inventoryLabel,
        inventory_slot: args.inventorySlot,
      },
      args.shipId,
      args.fuelAmount
    ),
    influenceDispatcherContract?.populateTransaction?.['run_system']?.(
      'RemoveFromWhitelist',
      [
        args.inventoryLabel,
        args.inventoryId,
        Permission.IDS.REMOVE_PRODUCTS,
        Entity.IDS.CREW,
        args.contractCrewId,
        Entity.IDS.CREW,
        args.inventoryOwnerCrewId,
      ]
    ),
    influenceDispatcherContract?.populateTransaction?.['run_system']?.(
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

  const write = useSendTransaction({
    calls: addFeedingCall(
      refuelCalls,
      args.contractCrewId,
      args.autoFeedingAmount
    ),
  })

  return write
}

const useDelegateCrewCall = (crewId: number, targetAddress: string) => {
  return influenceDispatcherContract?.populateTransaction?.['run_system']?.(
    'DelegateCrew',
    [targetAddress, Entity.IDS.CREW, crewId]
  )
}

export const useRegisterCrew = (crewId: number, manager: string) => {
  const delegateCrewCall = useDelegateCrewCall(
    crewId,
    env.NEXT_PUBLIC_FLOODGATE_CONTRACT_ADDRESS
  )

  return useSendTransaction({
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
  useSendTransaction({
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

  return useSendTransaction({
    calls: [
      ...(delegateBackTo ? [delegateCrewCall] : []),
      floodgateContract.populateTransaction.unregister_crew(crewId),
    ],
  })
}

export const useSetCrewLocked = (crewId: number, isLocked: boolean) =>
  useSendTransaction({
    calls: [
      floodgateContract.populateTransaction.set_crew_locked_status(
        crewId,
        isLocked
      ),
    ],
  })

export const useSetCrewManager = (crewId: number, managerAddress: string) =>
  useSendTransaction({
    calls: [
      floodgateContract.populateTransaction.transfer_crew_management(
        crewId,
        managerAddress
      ),
    ],
  })

const useFloodgateContractRead = (
  functionName: string,
  args: ArgsOrCalldata = []
) =>
  useReadContract({
    abi: [...floodgateAbi],
    watch: true,
    address: env.NEXT_PUBLIC_FLOODGATE_CONTRACT_ADDRESS as `0x${string}`,
    functionName,
    args,
  })

const useDevteamBalance = (address: string) => {
  const { data: address1 } = useFloodgateContractRead('get_devteam_address_one')
  const { data: address2 } = useFloodgateContractRead('get_devteam_address_two')
  const { data: balance1 } = useFloodgateContractRead('get_devteam_balance_one')
  const { data: balance2 } = useFloodgateContractRead('get_devteam_balance_two')

  if (BigInt(address) === address1 && balance1 !== undefined) {
    return [BigInt(balance1.toString()), 1] as const
  } else if (BigInt(address) === address2 && balance2 !== undefined) {
    return [BigInt(balance2.toString()), 2] as const
  } else {
    return [0n, 0] as const
  }
}

export const useFeeBalance = (address: string) => {
  const devteamBalance = useDevteamBalance(address)
  const { data } = useFloodgateContractRead('get_current_balance', [address])

  return {
    feeBalance: data ? BigInt(data.toString()) : 0n,
    devteamBalance,
  }
}

export const useWithdrawFees = (amount: bigint) =>
  useSendTransaction({
    calls: [floodgateContract.populateTransaction.withdraw_balance(amount)],
  })

export const useDevteamWithdraw = (amount: bigint, index: number) =>
  useSendTransaction({
    calls: [
      (index === 1
        ? floodgateContract.populateTransaction.withdraw_devteam_balance_one
        : floodgateContract.populateTransaction.withdraw_devteam_balance_two)(
        amount
      ),
    ],
  })

export const useDevteamShare = () => {
  const { data } = useReadContract({
    abi: [...floodgateAbi],
    address: env.NEXT_PUBLIC_FLOODGATE_CONTRACT_ADDRESS as `0x${string}`,
    functionName: 'get_devteam_share',
  })
  return data ? Number(data.toString()) / 1_000 : undefined
}

export const useSetFeedingConfig = (
  crewId: number,
  enabled: boolean,
  warehouseId: number
) =>
  useSendTransaction({
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
  useSendTransaction({
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
  const transferCall =
    floodgateContract.populateTransaction.service_transfer_goods(
      crewId,
      {
        inventory_id: destination.inventoryId,
        inventory_type: destination.inventoryType,
        inventory_slot: destination.inventorySlot,
      },
      transfers.map(({ source, contents }) =>
        cairo.tuple(
          {
            inventory_id: source.inventoryId,
            inventory_type: source.inventoryType,
            inventory_slot: source.inventorySlot,
          },
          contents.map((c) => ({
            item_id: c.product,
            item_quantity: c.amount,
          }))
        )
      )
    )

  const whitelistCalls = transfers
    .map(({ source }) =>
      influenceDispatcherContract?.populateTransaction?.['run_system']?.(
        'Whitelist',
        [
          source.inventoryType,
          source.inventoryId,
          Permission.IDS.REMOVE_PRODUCTS,
          Entity.IDS.CREW,
          crewId,
          Entity.IDS.CREW,
          source.owningCrewId,
        ]
      )
    )
    .concat([
      influenceDispatcherContract?.populateTransaction?.['run_system']?.(
        'Whitelist',
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
  const removeFromWhitelistCalls = transfers
    .flatMap(({ source }) => [
      influenceDispatcherContract?.populateTransaction?.['run_system']?.(
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
      influenceDispatcherContract?.populateTransaction?.['run_system']?.(
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

  return useSendTransaction({
    calls: addFeedingCall(
      [
        ...whitelistCalls,
        swayContract?.populateTransaction?.['increase_allowance']?.(
          floodgateContractAddress,
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

export const useCrewRefeeding = (
  args: { amount: number; crewId: number } & (
    | {
        type: 'default'
      }
    | {
        type: 'manual'
        warehouseId: number
      }
  )
) => {
  const call =
    args.type === 'default'
      ? floodgateContract.populateTransaction.resupply_food_from_default(
          args.crewId,
          args.amount
        )
      : floodgateContract.populateTransaction.resupply_food(
          args.crewId,
          {
            inventory_id: args.warehouseId,
            inventory_slot: 2,
            inventory_type: Entity.IDS.BUILDING,
          },
          args.amount
        )
  return useSendTransaction({
    calls: [call],
  })
}

export const useLotLeaseExtensions = (
  lotLeases: {
    lotId: number
    crewId: number
    addedDays: number
    rate: bigint
    recipient: string
  }[]
) => {
  const leaseCalls = lotLeases.flatMap((lease) => {
    const lotUuid = Entity.packEntity({
      id: lease.lotId,
      label: Entity.IDS.LOT,
    })
    const crewUuid = Entity.packEntity({
      id: lease.crewId,
      label: Entity.IDS.CREW,
    })
    const addedSeconds = BigInt(lease.addedDays) * 24n * 60n * 60n
    const memo = [lotUuid, Permission.IDS.USE_LOT, crewUuid]
    return [
      System.getTransferWithConfirmationCall(
        lease.recipient,
        lease.rate * BigInt(lease.addedDays),
        memo,
        influenceDispatcherAddress,
        swayAddress
      ),
      System.getRunSystemCall(
        'ExtendPrepaidAgreement',
        {
          target: {
            id: lease.lotId,
            label: Entity.IDS.LOT,
          },
          permission: Permission.IDS.USE_LOT,
          permitted: {
            id: lease.crewId,
            label: Entity.IDS.CREW,
          },
          added_term: addedSeconds,
          caller_crew: {
            id: lease.crewId,
            label: Entity.IDS.CREW,
          },
        },
        influenceDispatcherAddress
      ),
    ]
  })

  const floodgateFee =
    BigInt(Math.round(1_000 * Math.sqrt(lotLeases.length))) * 1_000_000n

  const leaseExtensionPrice = useMemo(
    () =>
      pipe(
        lotLeases,
        A.map((lease) => BigInt(lease.addedDays) * lease.rate),
        A.reduce(0n, (a, b) => a + b)
      ),
    [lotLeases]
  )

  return {
    leaseExtensionPrice,
    floodgateFee,
    contractWriteResult: useSendTransaction({
      calls: [
        swayContract?.populateTransaction?.['increase_allowance']?.(
          floodgateContractAddress,
          floodgateFee
        ),
        floodgateContract.populateTransaction.collect_generic_fee(floodgateFee),
        ...leaseCalls,
      ],
    }),
  }
}
