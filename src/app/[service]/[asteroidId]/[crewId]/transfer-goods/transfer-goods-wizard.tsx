'use client'

import { useQuery } from '@tanstack/react-query'
import { P, match } from 'ts-pattern'
import { getInventories } from './actions'
import { useTransferGoodsState } from './state'
import { SelectDestinationStep } from './select-destination-step'
import { SelectGoodsStep } from './select-goods-step'
import { ConfirmationStep } from './confirmation-step'
import { FloodgateCrew } from '@/lib/contract-types'
import { Wizard } from '@/components/ui/wizard'

export type TransferGoodsWizardProps = {
  address: string
  crew: FloodgateCrew
  actionFee: bigint
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
            state.destination !== undefined && state.deliveries.length > 0,
        },
        { title: 'Confirmation', completed: true },
      ]}
      wrapperClassName='overflow-auto grow h-full'
    >
      {match(result)
        .with({ isLoading: true }, () => <p>Loading...</p>)
        .with({ data: P.nonNullable }, ({ data: inventories }) => [
          <SelectDestinationStep
            key='1'
            inventories={inventories}
            destination={state.destination}
            dispatch={dispatch}
          />,
          state.destination ? (
            <SelectGoodsStep
              key='2'
              inventories={inventories}
              destination={state.destination}
              deliveries={state.deliveries}
              dispatch={dispatch}
            />
          ) : (
            <div />
          ),
          state.destination ? (
            <ConfirmationStep
              key='3'
              inventories={inventories}
              destination={state.destination}
              deliveries={state.deliveries}
            />
          ) : (
            <div />
          ),
        ])
        .with(P._, () => null)
        .exhaustive()}
    </Wizard>
  )
}
