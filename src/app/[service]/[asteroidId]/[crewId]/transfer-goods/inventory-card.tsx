import { Building, Entity, Ship } from '@influenceth/sdk'
import { Format, calcMassAndVolume, cn } from '@/lib/utils'
import {
  ShipImage,
  TankFarmImage,
  WarehouseImage,
} from '@/components/asset-images'
import type { Inventory } from '@/inventory-actions'

export type InventoryCardProps = {
  inventory: Inventory
  selected?: boolean
  onSelect?: () => void
}

const getInventoryImage = (inventory: Inventory) => {
  if (inventory.entity.label === Entity.IDS.SHIP) {
    return <ShipImage type={Ship.getType(inventory.entity.type)} size={100} />
  }
  return inventory.entity.type === Building.IDS.WAREHOUSE ? (
    <WarehouseImage size={100} />
  ) : (
    <TankFarmImage size={100} />
  )
}

export const InventoryCard = ({
  inventory,
  selected,
  onSelect,
}: InventoryCardProps) => {
  const image = getInventoryImage(inventory)

  const { mass, volume } = calcMassAndVolume(inventory.contents)

  const usedMass = inventory.reservedMass / 1000 + mass
  const usedVolume = inventory.reservedVolume / 1000 + volume
  const usedMassPercent = Math.round((usedMass / inventory.massCapacity) * 100)
  const usedVolumePercent = Math.round(
    (usedVolume / inventory.volumeCapacity) * 100
  )

  return (
    <div
      className={cn('flex flex-col gap-y-1 rounded p-1', {
        'bg-muted': selected,
        'cursor-pointer hover:bg-muted': onSelect,
      })}
      onClick={onSelect}
    >
      <div className='flex gap-x-2'>
        {image}
        <div className='flex flex-col gap-y-1'>
          <p className='font-bold'>{inventory.entity.name}</p>
          <p className='text-muted-foreground'>
            Mass: {Format.mass(usedMass)} /{' '}
            {Format.mass(inventory.massCapacity)} ({usedMassPercent}%)
          </p>
          <p className='text-muted-foreground'>
            Volume: {Format.volume(usedVolume)} /{' '}
            {Format.volume(inventory.volumeCapacity)} ({usedVolumePercent}%)
          </p>
        </div>
      </div>
    </div>
  )
}
