import { useAccount } from '@starknet-react/core'
import { ReactNode } from 'react'
import { ConnectWalletButton } from './connect-wallet-button'

export type RequireConnectedAccountProps = {
  children: (address: string) => ReactNode
}

export const RequireConnectedAccount = ({
  children,
}: RequireConnectedAccountProps) => {
  const { address } = useAccount()

  return address ? (
    children(address)
  ) : (
    <div className='flex h-full w-full items-center justify-center'>
      <ConnectWalletButton />
    </div>
  )
}
