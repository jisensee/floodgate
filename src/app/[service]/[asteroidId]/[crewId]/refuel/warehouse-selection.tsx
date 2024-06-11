import { FC } from 'react'
import { Asteroid } from '@influenceth/sdk'
import { Format, cn } from '@/lib/utils'
import { WarehouseImage } from '@/components/asset-images'
import { Ship, Warehouse } from '@/actions'
import { FloodgateCrew } from '@/lib/contract-types'

export type WarehouseSelectionProps = {
  warehouses: Warehouse[]
  selectedShip?: Ship
  selectedWarehouse?: Warehouse
  onWarehouseSelect: (warehouse: Warehouse) => void
  crew: FloodgateCrew
}

export const WarehouseSelection: FC<WarehouseSelectionProps> = ({
  warehouses,
  selectedShip,
  selectedWarehouse,
  onWarehouseSelect,
  crew,
}) => {
  const transportBonus = crew.bonuses.transportTime.totalBonus

  const getShipDistance = (warehouse: Warehouse) =>
    Asteroid.getLotDistance(
      crew.asteroidId,
      warehouse.lotIndex,
      selectedShip?.lotIndex ?? 0
    )
  const getTransportTime = (warehouse: Warehouse) =>
    Asteroid.getLotTravelTime(
      crew.asteroidId,
      warehouse.lotIndex,
      selectedShip?.lotIndex ?? 0,
      transportBonus
    ) / 24

  return (
    <ul className='flex flex-col gap-2 overflow-y-auto'>
      {warehouses.map((warehouse) => (
        <li
          key={warehouse.id}
          className={cn('flex cursor-pointer rounded p-2 hover:bg-muted', {
            'bg-muted': selectedWarehouse?.id === warehouse.id,
          })}
          onClick={() => onWarehouseSelect(warehouse)}
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
                to ship (
                <span className='text-foreground'>
                  {Format.duration(getTransportTime(warehouse))}
                </span>
                )
              </p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
