'use client'

import { useQuery } from '@tanstack/react-query'
import { FC, useEffect } from 'react'
import { State, useRefuelWizardState } from './state'
import { ShipSelection } from './ship-selection'
import { SourceInventorySelection } from './inventory-selection'
import { Confirmation } from './confirmation'
import { getShips, getSourceInventories } from './actions'
import { Skeleton } from '@/components/ui/skeleton'
import { FloodgateCrew } from '@/lib/contract-types'
import { Wizard, WizardStep } from '@/components/ui/wizard'

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
    queryKey: ['ships-inventories', address, crew.asteroidId],
    queryFn: () =>
      Promise.all([
        getShips(address, crew.asteroidId, volumeBonus.totalBonus),
        getSourceInventories(address, crew.asteroidId),
      ]),
  })

  useEffect(() => {
    if (userData && state.dataLoading) {
      const [ships, inventories] = userData
      dispatch({ type: 'set-data', ships, inventories: inventories })
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
        state.inventories.length > 0 && [
          <ShipSelection
            key='1'
            ships={state.ships}
            selectedShip={state.selectedShip}
            onShipSelect={(ship) => dispatch({ type: 'select-ship', ship })}
          />,
          <SourceInventorySelection
            key='2'
            crew={crew}
            inventories={state.inventories}
            selectedInventory={state.selectedInventory}
            selectedShip={state.selectedShip}
            onInventorySelect={(inventory) =>
              dispatch({ type: 'select-inventory', inventory: inventory })
            }
          />,
          ...(state.selectedShip && state.selectedInventory
            ? [
                <Confirmation
                  key='3'
                  crew={crew}
                  selectedShip={state.selectedShip}
                  selectedInventory={state.selectedInventory}
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
      {!state.dataLoading && state.inventories.length === 0 && (
        <div className='flex h-full items-center justify-center text-xl'>
          You have no inventories with fuel on {crew.asteroidName}.
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
    completed: !!state.selectedInventory,
    nextLabel: 'To Confirmation',
  },
  { title: 'Confirmation', nextLabel: 'Fuel Ship', completed: true },
]
