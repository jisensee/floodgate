import { Building, Product, ShipType } from '@influenceth/sdk'
import NextImage from 'next/image'
import { makeInfluenceImageUrls } from 'influence-typed-sdk/images'
import { FC } from 'react'
import { A } from '@mobily/ts-belt'
import { cn } from '@/lib/utils'
import { env } from '@/env'

type ShipImageProps = {
  type: ShipType
  size: number
}

const imageUrls = makeInfluenceImageUrls({
  cloudfrontImageHost: env.NEXT_PUBLIC_INFLUENCE_CLOUDFRONT_IMAGE_HOST,
  apiImagesUrl: 'https://images.influenceth.io/v1',
  cloudfrontBucket: 'unstoppablegames',
})

export const ShipImage: FC<ShipImageProps> = ({ type, size }) => {
  const url = imageUrls.ship(type, { w: size })
  return <NextImage src={url} width={size} height={0} alt={type.name} />
}

type WarehouseImageProps = {
  size: number
}

export const WarehouseImage: FC<WarehouseImageProps> = ({ size }) => {
  const url = imageUrls.building(Building.getType(Building.IDS.WAREHOUSE), {
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
    src={imageUrls.crewmate(crewmateId)}
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
    src={imageUrls.product(Product.getType(productId), { w: width })}
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
