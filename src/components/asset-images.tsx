import { Building, Entity, ShipType, Ship } from '@influenceth/sdk'
import NextImage from 'next/image'
import { makeInfluenceImageUrls } from 'influence-typed-sdk/images'
import { FC } from 'react'
import { A } from '@mobily/ts-belt'
import { cn } from '@/lib/utils'

type InventoryImageProps = {
  label: number,
  type: number,
  size: number
}

export const InventoryImage: FC<InventoryImageProps> = ({label, type, size }) => {
  let url = '', name = ''
  switch(label) {
    case Entity.IDS.SHIP:
      url = imageUrls.ship(type, { w: size })
      name = Ship.getType(type).name
      break;
    case Entity.IDS.BUILDING:
      url = imageUrls.building(type, { w: size })
      name = Building.getType(type).name
      break;
  }
  return <NextImage src={url} width={size} height={0} alt={name} />
}

type ShipImageProps = {
  type: ShipType
  size: number
}

const imageUrls = makeInfluenceImageUrls()

export const ShipImage: FC<ShipImageProps> = ({ type, size }) => {
  const url = imageUrls.ship(type.i, { w: size })
  return <NextImage src={url} width={size} height={0} alt={type.name} />
}

type WarehouseImageProps = {
  size: number
}

export const WarehouseImage: FC<WarehouseImageProps> = ({ size }) => {
  const url = imageUrls.building(Building.IDS.WAREHOUSE, {
    w: 100,
  })
  return <NextImage src={url} width={size} height={size} alt='Warehouse' />
}

export const AsteroidImage = ({ id, width }: { id: number; width: number }) => (
  <NextImage
    src={imageUrls.asteroid(id)}
    width={width}
    height={(width * 4) / 3}
    alt='Asteroid'
  />
)

type CrewmateImageProps = {
  crewmateId: number
  width: number
  className?: string
}

export const CrewmateImage = ({
  crewmateId,
  width,
  className,
}: CrewmateImageProps) => (
  <NextImage
    className={cn('rounded', className)}
    src={imageUrls.crewmate(crewmateId, { width })}
    alt={`Crewmate #${crewmateId}`}
    width={width}
    height={(width * 4) / 3}
    style={{ objectFit: 'contain' }}
  />
)

export type CrewImagesProps = {
  className?: string
  crewmateIds: number[]
  width: number
  onlyCaptain?: boolean
}
export const CrewImages = ({
  className,
  crewmateIds,
  width,
  onlyCaptain,
}: CrewImagesProps) => (
  <div
    className={cn(
      'flex shrink-0 flex-row flex-wrap justify-center gap-1',
      className
    )}
  >
    {(onlyCaptain ? A.take(crewmateIds, 1) : crewmateIds).map((id) => (
      <CrewmateImage key={id} crewmateId={id} width={width} />
    ))}
  </div>
)

export type ProductImageProps = {
  productId: number
  width: number
}

export const ProductImage = ({ productId, width }: ProductImageProps) => (
  <NextImage
    src={imageUrls.product(productId, { w: width })}
    width={width}
    height={width}
    alt='product'
  />
)

export type SwayIconProps = {
  className?: string
  size: number
}

export const SwayIcon = ({ className, size }: SwayIconProps) => (
  <NextImage
    className={className}
    src='/sway-logo.png'
    alt='SWAY logo'
    width={size}
    height={size}
    style={{ objectFit: 'contain' }}
  />
)
