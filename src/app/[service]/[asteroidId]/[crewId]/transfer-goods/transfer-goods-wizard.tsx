'use client'

import { useQuery } from '@tanstack/react-query'
import { P, match } from 'ts-pattern'
import { getDeliveriesContents, useTransferGoodsState } from './state'
import { SelectDestinationStep } from './select-destination-step'
import { SelectGoodsStep } from './select-goods-step'
import { ConfirmationStep } from './confirmation-step'
import { FloodgateCrew } from '@/lib/contract-types'
import { Wizard } from '@/components/ui/wizard'
import { Skeleton } from '@/components/ui/skeleton'
import { getInventories, Inventory } from '@/inventory-actions'
import { Entity } from '@influenceth/sdk'

export type TransferGoodsWizardProps = {
  address: string
  crew: FloodgateCrew
  actionFee: bigint
}

const inventorySorting = (a: Inventory, b: Inventory) => {
  if (a.entity.id == b.entity.id) return a.isPropellantBay ? 1 : -1
  if (a.entity.label == b.entity.label) return (a.entity.name > b.entity.name) ? 1 : -1
  return b.entity.label - a.entity.label
}

export const TransferGoodsWizard = ({
  crew,
  address,
}: TransferGoodsWizardProps) => {
  const result = useQuery({
    queryKey: ['ships-warehouses', address, crew.asteroidId],
    queryFn: () => getInventories(address, crew.asteroidId),
  })
  const [state, dispatch] = useTransferGoodsState()

  return (
    <Wizard
      steps={[
        {
          title: 'Destination',
          completed: state.destination !== undefined,
          nextLabel: 'Select Goods',
        },
        {
          title: 'Select Goods',
          completed:
            state.destination !== undefined &&
            getDeliveriesContents(state.deliveries).length > 0,
        },
        { title: 'Confirmation', completed: true },
      ]}
      wrapperClassName='overflow-auto grow h-full'
    >
      {match(result)
        .with({ isLoading: true }, () => (
          <div className='flex h-full grow flex-col gap-y-3'>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className='flex gap-x-5'>
                <Skeleton className='h-20 w-32' />
                <div className='flex flex-col gap-y-1'>
                  <Skeleton className='h-4 w-64' />
                  <Skeleton className='h-3 w-32' />
                </div>
              </div>
            ))}
          </div>
        ))
        .with({ data: P.nonNullable }, ({ data: inventories }) => [
          <SelectDestinationStep
            key='1'
            inventories={inventories.sort((a, b) => inventorySorting(a, b))}
            destination={state.destination}
            dispatch={dispatch}
          />,
          state.destination ? (
            <SelectGoodsStep
              key='2'
              inventories={inventories.filter((i) => i.contents.length > 0).filter((i) => i.inventoryUuid != state.destination?.inventoryUuid).sort((a, b) => inventorySorting(a, b))}
              destination={state.destination}
              deliveries={state.deliveries}
              crew={crew}
              dispatch={dispatch}
            />
          ) : (
            <div key='2' />
          ),
          state.destination ? (
            <ConfirmationStep
              key='3'
              inventories={inventories.filter((i) => i.contents.length > 0).filter((i) => i.inventoryUuid != state.destination?.inventoryUuid).sort((a, b) => inventorySorting(a, b))}
              destination={state.destination}
              deliveries={state.deliveries}
              crew={crew}
              onReset={() => dispatch({ type: 'reset' })}
            />
          ) : (
            <div key='3' />
          ),
        ])
        .with(P._, () => null)
        .exhaustive()}
    </Wizard>
  )
}
