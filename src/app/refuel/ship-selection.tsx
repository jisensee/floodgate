import { FC } from 'react'
import { ShipImage } from '../../components/asset-images'
import { Progress } from '../../components/ui/progress'
import { StepProps } from './state'
import { Format, cn } from '@/lib/utils'

export const ShipSelection: FC<StepProps> = ({ state, dispatch }) => {
  return (
    <div className='flex flex-col gap-2 overflow-y-auto'>
      {state.ships.map((ship) => (
        <div
          key={ship.id}
          className={cn(
            'flex cursor-pointer flex-col gap-y-1 rounded px-1 py-2 hover:bg-secondary',
            {
              'bg-secondary': state.selectedShip?.id === ship.id,
            }
          )}
        >
          <div
            className='flex'
            onClick={() =>
              dispatch({
                type: 'select-ship',
                ship,
              })
            }
          >
            <ShipImage type={ship.type} size={150} />
            <div className='flex flex-col gap-y-1'>
              <p className='font-bold'>{ship.name}</p>
              <p className='text-sm font-bold text-muted-foreground'>
                {ship.type.name}
              </p>
              <p className='text-sm text-muted-foreground'>
                Fuel: {Format.mass(ship.fuelAmount)} /{' '}
                {Format.mass(ship.fuelCapacity)}t (
                {Math.round(
                  (ship.fuelAmount / ship.fuelCapacity) * 100
                ).toLocaleString()}
                %)
              </p>
              <p className='text-sm text-muted-foreground'>
                Location: #{ship.lotIndex.toLocaleString()}
              </p>
            </div>
          </div>
          <Progress
            className='h-1'
            value={(ship.fuelAmount / ship.fuelCapacity) * 100}
          />
        </div>
      ))}
    </div>
  )
}
