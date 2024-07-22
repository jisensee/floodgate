import { O, pipe } from '@mobily/ts-belt'
import NextImage from 'next/image'
import { Fragment } from 'react'

export type WalletIconProps = {
  className?: string
  icon:
    | string
    | {
        dark?: string
        light?: string
      }
}
export const WalletIcon = ({ icon, className }: WalletIconProps) =>
  pipe(
    typeof icon === 'string' ? icon : icon.light ?? icon.dark,
    O.map(getIconUrl),
    O.mapWithDefault(<Fragment />, (iconUrl) => (
      // eslint-disable-next-line react/jsx-key
      <NextImage
        className={className}
        src={iconUrl}
        width={24}
        height={24}
        alt=''
      />
    ))
  )

const getIconUrl = (icon: string) =>
  icon.startsWith('data:') ? icon : `data:image/svg+xml;base64,${btoa(icon)}`
