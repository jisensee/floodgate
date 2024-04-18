import { useStarkName } from '@starknet-react/core'
import { FC } from 'react'

type AddressProps = {
  address: string
  shownCharacters?: number
}

export const Address: FC<AddressProps> = ({ address, shownCharacters = 4 }) => {
  const { data } = useStarkName({ address })

  const start = address.slice(0, shownCharacters + 2)
  const end = address.slice(-shownCharacters)
  const value = `${start}...${end}`
  return <span>{data ?? value}</span>
}
