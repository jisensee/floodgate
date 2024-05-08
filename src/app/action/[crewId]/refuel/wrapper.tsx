'use client'

import { useAccount } from '@starknet-react/core'
import { RefuelingWizard } from './refueling-wizard'
import { FloodgateCrew } from '@/lib/contract-types'
import { ConnectWalletButton } from '@/components/connect-wallet-button'

export const Wrapper = ({
  crew,
  actionFee,
}: {
  crew: FloodgateCrew
  actionFee: bigint
}) => {
  const { address } = useAccount()
  return (
    <>
      {address && (
        <RefuelingWizard address={address} crew={crew} actionFee={actionFee} />
      )}
      {!address && (
        <div className='flex h-full flex-col items-center justify-center gap-y-5 text-xl'>
          <p>You need to connect your wallet to refuel a ship.</p>
          <ConnectWalletButton />
        </div>
      )}
    </>
  )
}
