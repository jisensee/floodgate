import { useAccount } from '@starknet-react/core'
import { ReactNode } from 'react'
import { P, match } from 'ts-pattern'
import { ConnectWalletButton } from './connect-wallet-button'

export type RequireConnectedAccountProps = {
  children: (address: string) => ReactNode
}

export const RequireConnectedAccount = ({
  children,
}: RequireConnectedAccountProps) =>
  match(useAccount())
    .with(
      {
        address: P.string,
      },
      ({ address }) => children(address)
    )
    .with({ status: P.union('connecting', 'reconnecting') }, () => null)
    .otherwise(() => (
      <div className='flex h-full w-full items-center justify-center'>
        <ConnectWalletButton />
      </div>
    ))
