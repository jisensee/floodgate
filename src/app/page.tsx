'use client'

import { useAccount } from '@starknet-react/core'
import { ConnectWalletButton } from './connect-wallet-button'
import { WalletInfo } from './wallet-info'
import { TransactionButton } from './transaction-button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function Home() {
  const { address } = useAccount()

  return (
    <main className='flex min-h-screen items-center justify-center'>
      <Card>
        <CardHeader>
          <CardTitle>Rent a Crew</CardTitle>
          {address && <CardDescription>Submit a transaction.</CardDescription>}
          {!address && (
            <CardDescription>
              Connect your wallet to get started.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className='flex justify-center'>
          {!address && <ConnectWalletButton />}
          {address && (
            <div>
              <WalletInfo address={address} />
              <TransactionButton />
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
