'use client'

import { useQuery } from '@tanstack/react-query'
import { FC, useEffect } from 'react'
import { Wizard, WizardStep } from '../../../../components/ui/wizard'
import { State, useRefuelWizardState } from './state'
import { ShipSelection } from './ship-selection'
import { WarehouseSelection } from './warehouse-selection'
import { Confirmation } from './confirmation'
import { Skeleton } from '@/components/ui/skeleton'
import { getShips, getWarehouses } from '@/actions'
import { FloodgateCrew } from '@/lib/contract-types'

export type RefuelingWizardProps = {
  address: string
  crew: FloodgateCrew
  actionFee: bigint
}

export const RefuelingWizard: FC<RefuelingWizardProps> = ({
  address,
  crew,
  actionFee,
}) => {
  const [state, dispatch] = useRefuelWizardState()

  const volumeBonus = crew.bonuses.volumeCapacity

  const { data: userData, refetch } = useQuery({
    queryKey: ['ships-warehouses', address],
    queryFn: () =>
      Promise.all([
        getShips(address, crew.asteroidId, volumeBonus.totalBonus),
        getWarehouses(address, crew.asteroidId),
      ]),
  })

  useEffect(() => {
    if (userData && state.dataLoading) {
      const [ships, warehouses] = userData
      dispatch({ type: 'set-data', ships, warehouses })
    }
  }, [userData, dispatch, state.dataLoading])

  const steps = useSteps(state)

  return (
    <Wizard steps={steps} wrapperClassName='overflow-auto grow h-full'>
      {state.dataLoading && (
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
      )}
      {!state.dataLoading &&
        state.ships.length > 0 &&
        state.warehouses.length > 0 && [
          <ShipSelection
            key='1'
            ships={state.ships}
            selectedShip={state.selectedShip}
            onShipSelect={(ship) => dispatch({ type: 'select-ship', ship })}
          />,
          <WarehouseSelection
            key='2'
            crew={crew}
            warehouses={state.warehouses}
            selectedWarehouse={state.selectedWarehouse}
            selectedShip={state.selectedShip}
            onWarehouseSelect={(warehouse) =>
              dispatch({ type: 'select-warehouse', warehouse })
            }
          />,
          ...(state.selectedShip && state.selectedWarehouse
            ? [
                <Confirmation
                  key='3'
                  crew={crew}
                  selectedShip={state.selectedShip}
                  selectedWarehouse={state.selectedWarehouse}
                  actionFee={actionFee}
                  onReset={() => {
                    refetch()
                    dispatch({ type: 'reset' })
                  }}
                />,
              ]
            : []),
        ]}
      {!state.dataLoading && state.ships.length === 0 && (
        <div className='flex h-full items-center justify-center text-xl'>
          You have no ships to fuel on {crew.asteroidName}.
        </div>
      )}
      {!state.dataLoading && state.warehouses.length === 0 && (
        <div className='flex h-full items-center justify-center text-xl'>
          You have no warehouses with fuel on {crew.asteroidName}.
        </div>
      )}
    </Wizard>
  )
}

const useSteps = (state: State): WizardStep[] => [
  {
    title: 'Ship',
    completed: !!state.selectedShip,
    nextLabel: 'Select Fuel Source',
  },
  {
    title: 'Fuel Source',
    completed: !!state.selectedWarehouse,
    nextLabel: 'To Confirmation',
  },
  { title: 'Confirmation', nextLabel: 'Fuel Ship', completed: true },
]
