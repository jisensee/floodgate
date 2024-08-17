import { FC } from 'react'
import { Asteroid } from '@influenceth/sdk'
import { Ship, SourceInventory } from './actions'
import { Format, cn } from '@/lib/utils'
import { InventoryImage } from '@/components/asset-images'
import { FloodgateCrew } from '@/lib/contract-types'

export type InventorySelectionProps = {
  inventories: SourceInventory[]
  selectedShip?: Ship
  selectedInventory?: SourceInventory
  onInventorySelect: (inventory: SourceInventory) => void
  crew: FloodgateCrew
}

export const SourceInventorySelection: FC<InventorySelectionProps> = ({
  inventories,
  selectedShip,
  selectedInventory,
  onInventorySelect,
  crew,
}) => {
  const transportBonus = crew.bonuses.transportTime.totalBonus

  const getShipDistance = (inventory: SourceInventory) =>
    Asteroid.getLotDistance(
      crew.asteroidId,
      inventory.lotIndex,
      selectedShip?.lotIndex ?? 0
    )
  const getTransportTime = (inventory: SourceInventory) =>
    Asteroid.getLotTravelTime(
      crew.asteroidId,
      inventory.lotIndex,
      selectedShip?.lotIndex ?? 0,
      transportBonus
    ) / 24

  return (
    <ul className='flex flex-col gap-2 overflow-y-auto'>
      {inventories.filter((i) => !(i.id == selectedShip?.id && i.isPropellantBay)).map((inventory) => (
        <li
          key={inventory.id * 10 + inventory.slot}
          className={cn('flex cursor-pointer rounded p-2 hover:bg-muted', {
            'bg-muted': selectedInventory?.id === inventory.id && selectedInventory?.slot === inventory.slot,
          })}
          onClick={() => onInventorySelect(inventory)}
        >
          <div className='flex gap-x-3'>
            <InventoryImage label={inventory.label} type={inventory.type} size={100} />
            <div className='flex flex-col gap-y-1'>
              <p className='font-bold'>
                {inventory.name}
                <span className='font-normal text-[#884FFF]'>{ inventory.isPropellantBay ? ' (Propellant)' : '' }</span>
              </p>
              <p className='text-muted-foreground'>
                <span className='text-foreground'>
                  {Format.mass(inventory.fuelAmount)}
                </span>{' '}
                fuel available
              </p>
              <p className='text-muted-foreground'>
                <span className='text-foreground'>
                  {Format.distance(getShipDistance(inventory))}
                </span>{' '}
                to ship (
                <span className='text-foreground'>
                  {Format.duration(getTransportTime(inventory))}
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
