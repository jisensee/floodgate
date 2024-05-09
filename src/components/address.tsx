import { useStarkName } from '@starknet-react/core'
import { FC } from 'react'

type AddressProps = {
  address: string
  shownCharacters?: number
}

export const Address: FC<AddressProps> = ({ address, shownCharacters }) => {
  const { data } = useStarkName({ address })

  const value = getTrimmedAddress(address, shownCharacters)
  return (
    <span className='overflow-hidden overflow-ellipsis'>{data ?? value}</span>
  )
}

const getTrimmedAddress = (address: string, shownCharacters?: number) => {
  if (shownCharacters) {
    const start = address.slice(0, shownCharacters + 2)
    const end = address.slice(-shownCharacters)
    return `${start}...${end}`
  }
  return address
}
