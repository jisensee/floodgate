import { Building, ShipType } from '@influenceth/sdk'
import NextImage from 'next/image'
import { makeInfluenceImageUrls } from 'influence-typed-sdk/images'
import { FC } from 'react'
import { cn } from '@/lib/utils'

type ShipImageProps = {
  type: ShipType
  size: number
}

const imageUrls = makeInfluenceImageUrls()

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
    className={cn('rounded border border-border', className)}
    src={imageUrls.crewmate(crewmateId)}
    alt='crewmate'
    width={width}
    height={(width * 4) / 3}
  />
)
