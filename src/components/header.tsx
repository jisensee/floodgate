'use client'

import { Home, Plus } from 'lucide-react'
import { useAccount } from '@starknet-react/core'
import { ConnectWalletButton } from './connect-wallet-button'

import { Button } from './ui/button'
import { Link } from './ui/link'
import { AccountInfo } from '@/app/account-info'

export const Header = () => {
  return (
    <div className='fixed top-0 z-50 flex w-full items-center justify-between bg-background px-3 py-2'>
      <div className='flex w-full items-center justify-between'>
        <Link href='/' className='flex gap-x-2 hover:text-primary'>
          <Home size={24} />
          <span className='hidden md:block'>Home</span>
        </Link>
        <div className='flex gap-x-2'>
          <RegisterCrewButton />
          <WalletSection />
        </div>
      </div>
    </div>
  )
}

const WalletSection = () => {
  const { address, connector } = useAccount()
  return (
    <>
      {!address && <ConnectWalletButton size='sm' />}
      {address && connector && (
        <AccountInfo address={address} connector={connector} />
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
