import { useBalance } from '@starknet-react/core'
import { FC } from 'react'
import { SwayAmount } from '@/components/sway-amount'
import { Address } from '@/components/address'
import { env } from '@/env'

type AccountInfoProps = {
  address: string
}

export const AccountInfo: FC<AccountInfoProps> = ({ address }) => {
  const { data } = useBalance({
    address,
    token: env.NEXT_PUBLIC_SWAY_CONTRACT_ADDRESS,
  })

  const swayBalance = data ? parseFloat(data.formatted) : undefined

  return (
    <div className='flex flex-row items-center gap-x-3 rounded-md border border-primary px-3 py-1'>
      {swayBalance && (
        <>
          <SwayAmount amount={swayBalance} />|
        </>
      )}
      <Address address={address} />
    </div>
  )
}
