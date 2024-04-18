'use client'

import { useAccount } from '@starknet-react/core'
import { RefuelingWizard } from '@/app/refuel/refueling-wizard'
import { Page } from '@/components/page'
import { ConnectWalletButton } from '@/components/connect-wallet-button'

export default function RefuelingPage() {
  const { address } = useAccount()

  return (
    <Page title='Refuel Ship'>
      {address && <RefuelingWizard address={address} />}
      {!address && <ConnectWalletButton />}
    </Page>
  )
}
