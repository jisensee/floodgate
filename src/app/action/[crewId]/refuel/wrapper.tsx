'use client'

import { useAccount } from '@starknet-react/core'
import { RefuelingWizard } from './refueling-wizard'
import { ContractCrew } from '@/lib/contract'
import { ConnectWalletButton } from '@/components/connect-wallet-button'

export const Wrapper = ({ crew }: { crew: ContractCrew }) => {
  const { address } = useAccount()
  return (
    <>
      {address && <RefuelingWizard address={address} crew={crew} />}
      {!address && (
        <div className='flex h-full flex-col items-center justify-center gap-y-5 text-xl'>
          <p>You need to connect your wallet to refuel a ship.</p>
          <ConnectWalletButton />
        </div>
      )}
    </>
  )
}
