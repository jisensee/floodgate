import { type Inventory } from './actions'
import { Format, calcMassAndVolume, cn } from '@/lib/utils'
import { ShipImage, WarehouseImage } from '@/components/asset-images'

export type InventoryCardProps = {
  inventory: Inventory
  selected?: boolean
  onSelect?: () => void
}

export const InventoryCard = ({
  inventory,
  selected,
  onSelect,
}: InventoryCardProps) => {
  const image =
    inventory.type === 'ship' ? (
      <ShipImage type={inventory.shipType} size={100} />
    ) : (
      <WarehouseImage size={100} />
    )

  const { mass, volume } = calcMassAndVolume(inventory.contents)

  const usedMass = inventory.reservedMass / 1000 + mass
  const usedVolume = inventory.reservedVolume / 1000 + volume
  const usedMassPercent = Math.round(
    (usedMass / (inventory.massCapacity / 1000)) * 100
  )
  const usedVolumePercent = Math.round(
    (usedVolume / (inventory.volumeCapacity / 1000)) * 100
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
          <p className='font-bold'>{inventory.name}</p>
          <p className='text-muted-foreground'>
            Mass: {Format.mass(usedMass)} /{' '}
            {Format.mass(inventory.massCapacity / 1000)} ({usedMassPercent}%)
          </p>
          <p className='text-muted-foreground'>
            Volume: {Format.volume(usedVolume)} /{' '}
            {Format.volume(inventory.volumeCapacity / 1000)} (
            {usedVolumePercent}%)
          </p>
        </div>
      </div>
    </div>
  )
}
