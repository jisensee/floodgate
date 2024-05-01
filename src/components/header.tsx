'use client'

import { Home, Plus } from 'lucide-react'
import { useAccount } from '@starknet-react/core'
import { ConnectWalletButton } from './connect-wallet-button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip'
import { Button } from './ui/button'
import { Link } from './ui/link'
import { AccountInfo } from '@/app/account-info'

export const Header = () => {
  return (
    <div className='fixed top-0 flex w-full items-center justify-between px-3 py-2'>
      <div className='flex w-full items-center justify-between'>
        <Link href='/' className='flex gap-x-2 hover:text-primary'>
          <Home size={24} />
          Home
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
  <TooltipProvider delayDuration={0}>
    <Tooltip>
      <TooltipTrigger asChild className='hidden md:flex'>
        <Button className='opacity-50' icon={<Plus />} size='sm'>
          Register your crew
        </Button>
      </TooltipTrigger>
      <TooltipContent>Coming soon</TooltipContent>
    </Tooltip>
  </TooltipProvider>
)
