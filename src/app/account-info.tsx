import { useBalance } from '@starknet-react/core'
import { FC } from 'react'
import { SwayAmount } from '@/components/sway-amount'
import { Address } from '@/components/address'

type AccountInfoProps = {
  address: string
}

const swayAddress =
  '0x0030058f19ed447208015f6430f0102e8ab82d6c291566d7e73fe8e613c3d2ed'

export const AccountInfo: FC<AccountInfoProps> = ({ address }) => {
  const { data } = useBalance({ address, token: swayAddress })

  const swayBalance = data ? parseFloat(data.formatted) : undefined

  return (
    <div className='flex flex-row gap-x-3 rounded-md border border-primary px-3 py-1'>
      {swayBalance && (
        <>
          <SwayAmount amount={swayBalance} />|
        </>
      )}
      <Address address={address} />
    </div>
  )
}
