'use client'

import { useQuery } from '@tanstack/react-query'
import { FC, useEffect } from 'react'
import { Wizard, WizardStep } from '../../components/ui/wizard'
import { State, useRefuelWizardState } from './state'
import { ShipSelection } from './ship-selection'
import { WarehouseSelection } from './warehouse-selection'
import { Confirmation } from './confirmation'
import { Skeleton } from '@/components/ui/skeleton'
import { getShips, getWarehouses } from '@/actions'
import { useContractCrew } from '@/hooks/contract'

export type RefuelingWizardProps = {
  address: string
}

export const RefuelingWizard: FC<RefuelingWizardProps> = ({ address }) => {
  const [state, dispatch] = useRefuelWizardState()

  const { data: userData } = useQuery({
    queryKey: ['ships-warehouses', address],
    queryFn: () => Promise.all([getShips(address), getWarehouses(address)]),
  })
  const { crewData } = useContractCrew()

  useEffect(() => {
    if (userData && crewData && state.dataLoading) {
      const [ships, warehouses] = userData
      dispatch({ type: 'set-data', ships, warehouses, crewData })
    }
  }, [userData, crewData, dispatch, state.dataLoading])

  const steps = useSteps(state)
  const stepProps = { state, dispatch }

  return (
    <Wizard steps={steps} wrapperClassName='overflow-auto grow h-full'>
      {state.dataLoading ? (
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
      ) : (
        [
          <ShipSelection key='1' {...stepProps} />,
          <WarehouseSelection key='2' {...stepProps} />,
          <Confirmation key='3' {...stepProps} />,
        ]
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
