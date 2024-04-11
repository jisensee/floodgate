import { useBalance } from '@starknet-react/core'
import { FC } from 'react'

type WalletInfoProps = {
  address: string
}

export const WalletInfo: FC<WalletInfoProps> = ({ address }) => {
  const { data } = useBalance({ address })

  return (
    <div className='flex flex-col'>
      <p>{address}</p>
      {data?.value !== undefined && (
        <p>
          {(
            Number((data.value * 10_000n) / BigInt(1e18)) / 10_000
          ).toLocaleString() + ' ETH'}
        </p>
      )}
    </div>
  )
}
