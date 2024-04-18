import { FC } from 'react'
import { Asteroid } from '@influenceth/sdk'
import { StepProps } from './state'
import { Format, cn } from '@/lib/utils'
import { WarehouseImage } from '@/components/asset-images'
import { Warehouse } from '@/actions'

export const WarehouseSelection: FC<StepProps> = ({ state, dispatch }) => {
  const getShipDistance = (warehouse: Warehouse) =>
    Asteroid.getLotDistance(
      1,
      warehouse.lotIndex,
      state.selectedShip?.lotIndex ?? 0
    )

  return (
    <ul className='flex flex-col gap-2 overflow-y-auto'>
      {state.warehouses.map((warehouse) => (
        <li
          key={warehouse.id}
          className={cn('flex cursor-pointer rounded p-2 hover:bg-secondary', {
            'bg-secondary': state.selectedWarehouse?.id === warehouse.id,
          })}
          onClick={() =>
            dispatch({
              type: 'select-warehouse',
              warehouse,
            })
          }
        >
          <div className='flex gap-x-3'>
            <WarehouseImage size={100} />
            <div className='flex flex-col gap-y-1'>
              <p className='font-bold'>{warehouse.name}</p>
              <p className='text-muted-foreground'>
                <span className='text-foreground'>
                  {Format.mass(warehouse.fuelAmount)}
                </span>{' '}
                fuel available
              </p>
              <p className='text-muted-foreground'>
                <span className='text-foreground'>
                  {Format.distance(getShipDistance(warehouse))}
                </span>{' '}
                to ship
              </p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
