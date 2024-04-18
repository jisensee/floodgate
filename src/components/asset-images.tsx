import { Building, ShipType } from '@influenceth/sdk'
import NextImage from 'next/image'
import { FC } from 'react'
import { makeImageUrls } from '@/lib/image-urls'

type ShipImageProps = {
  type: ShipType
  size: number
}

export const ShipImage: FC<ShipImageProps> = ({ type, size }) => {
  const url = makeImageUrls().ship(type, { w: size })
  return <NextImage src={url} width={size} height={0} alt={type.name} />
}

type WarehouseImageProps = {
  size: number
}

export const WarehouseImage: FC<WarehouseImageProps> = ({ size }) => {
  const url = makeImageUrls().building(
    Building.getType(Building.IDS.WAREHOUSE),
    {
      w: 100,
    }
  )
  return <NextImage src={url} width={size} height={size} alt='Warehouse' />
}
