import { FC } from 'react'
import { Format, cn } from '@/lib/utils'
import { Ship } from '@/actions'
import { ShipImage } from '@/components/asset-images'
import { Progress } from '@/components/ui/progress'

export type ShipSelectionProps = {
  ships: Ship[]
  selectedShip?: Ship
  onShipSelect: (ship: Ship) => void
}

export const ShipSelection: FC<ShipSelectionProps> = ({
  ships,
  selectedShip,
  onShipSelect,
}) => {
  return (
    <div className='flex flex-col gap-2 overflow-y-auto'>
      {ships.map((ship) => (
        <div
          key={ship.id}
          className={cn(
            'flex cursor-pointer flex-col gap-y-1 rounded px-1 py-2 hover:bg-muted',
            {
              'bg-muted': selectedShip?.id === ship.id,
            }
          )}
        >
          <div className='flex' onClick={() => onShipSelect(ship)}>
            <ShipImage type={ship.type} size={150} />
            <div className='flex flex-col gap-y-1'>
              <p className='font-bold'>{ship.name}</p>
              <p className='text-sm font-bold text-muted-foreground'>
                {ship.type.name}
              </p>
              <p className='text-sm text-muted-foreground'>
                Fuel: {Format.mass(ship.fuelAmount)} /{' '}
                {Format.mass(ship.fuelCapacity)} (
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
            indicators={[
              {
                value: (ship.fuelAmount / ship.fuelCapacity) * 100,
              },
            ]}
          />
        </div>
      ))}
    </div>
  )
}
