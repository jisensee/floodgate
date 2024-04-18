'use client'

import { Home } from 'lucide-react'
import Link from 'next/link'
import { useAccount } from '@starknet-react/core'
import { ConnectWalletButton } from './connect-wallet-button'
import { AccountInfo } from '@/app/account-info'

export const Header = () => {
  const { address } = useAccount()
  return (
    <div className='fixed top-0 flex w-full items-center justify-between px-3 py-2'>
      <Link href='/'>
        <Home size={24} />
      </Link>
      {!address && <ConnectWalletButton />}
      {address && <AccountInfo address={address} />}
    </div>
  )
}
