import {
  Assets,
  type BuildingType,
  type ProductType,
  type ShipType,
} from '@influenceth/sdk'
import { env } from '@/env'

const defaultCloudfrontBucket = 'unstoppablegames'
const defaultCloudfrontImageHost = `https://${env.NEXT_PUBLIC_INFLUENCE_CLOUDFRONT_IMAGE_HOST}`

export type ImageSize = {
  w?: number
  h?: number
  f?: 'cover' | 'contain' | 'scale'
}

const getSlug = (assetName: string) => {
  return (assetName || '').replace(/[^a-z]/gi, '')
}

export type ImageUrlsConfig = {
  cloudfrontImageHost: string
  cloudfrontBucket: string
}

const defaultImageUrlsConfig: ImageUrlsConfig = {
  cloudfrontImageHost: defaultCloudfrontImageHost,
  cloudfrontBucket: defaultCloudfrontBucket,
}

export const crewmateImageUrl = (crewmateId: number) =>
  `https://images-prerelease.influenceth.io/v1/crew/${crewmateId}/image.svg?bustOnly=true`

export const makeImageUrls = (config = defaultImageUrlsConfig) => {
  const getCloudfrontUrl = (rawSlug: string, { w, h, f }: ImageSize = {}) => {
    const slug =
      w || h
        ? btoa(
            JSON.stringify({
              key: rawSlug,
              bucket: config.cloudfrontBucket,
              edits: {
                resize: {
                  width: w,
                  height: h,
                  fit: f,
                },
              },
            })
          )
        : rawSlug
    return `${config.cloudfrontImageHost}/${slug}`
  }
  const getIconUrl = (
    type: string,
    assetName: string,
    iconVersion: number,
    { append, w, h, f }: ImageSize & { append?: string } = {}
  ) =>
    getCloudfrontUrl(
      `influence/production/images/icons/${type}/${getSlug(assetName)}${append || ''}.v${iconVersion || '1'}.png`,
      { w, h, f }
    )

  return {
    product: (product: ProductType, size: ImageSize) =>
      getIconUrl(
        'resources',
        product.name,
        Assets.Product[product.i]?.iconVersion ?? 0,
        size
      ),

    building: (building: BuildingType, size: ImageSize, isHologram = false) =>
      getIconUrl(
        'buildings',
        building.name,
        Assets.Building[building.i]?.iconVersion ?? 0,
        { ...size, append: isHologram ? '_Site' : undefined }
      ),

    ship: (ship: ShipType, size: ImageSize, isHologram = false) =>
      getIconUrl('ships', ship.name, Assets.Ship[ship.i]?.iconVersion ?? 0, {
        ...size,
        append: isHologram ? '_Holo' : undefined,
      }),
  }
}
