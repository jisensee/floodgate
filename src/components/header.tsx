'use client'

import { Home, Plus } from 'lucide-react'
import { useAccount } from '@starknet-react/core'
import { ConnectWalletButton } from './connect-wallet-button'

import { Button } from './ui/button'
import { Link } from './ui/link'
import { Badge } from './ui/badge'
import { AccountInfo } from '@/app/account-info'
import { env } from '@/env'

export const Header = () => {
  return (
    <div className='fixed top-0 z-50 flex w-full items-center justify-between bg-background px-3 py-2'>
      <div className='flex w-full items-center justify-between'>
        <div className='flex items-center gap-x-5'>
          <Link href='/' className='flex gap-x-2 hover:text-primary'>
            <Home size={24} />
            <span className='hidden md:block'>Home</span>
          </Link>
          {env.NEXT_PUBLIC_CHAIN === 'testnet' && (
            <Badge variant='destructive'>Testnet</Badge>
          )}
        </div>
        <div className='flex gap-x-2'>
          <RegisterCrewButton />
          <WalletSection />
        </div>
      </div>
    </div>
  )
}

const WalletSection = () => {
  const { account, connector } = useAccount()

  const walletId =
    connector?.id ??
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ((account as any)?.['walletProvider']?.id as string | undefined)

  return (
    <>
      {!account && <ConnectWalletButton size='sm' />}
      {account && walletId && (
        <AccountInfo
          address={account.address as `0x${string}`}
          connector={connector}
          walletId={walletId}
        />
      )}
    </>
  )
}

const RegisterCrewButton = () => (
  <Link className='hidden md:block' href='/register'>
    <Button icon={<Plus />} size='sm'>
      Register your crew
    </Button>
  </Link>
)
