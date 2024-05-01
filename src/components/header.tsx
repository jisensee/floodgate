'use client'

import { Home, Plus } from 'lucide-react'
import Link from 'next/link'
import { useAccount } from '@starknet-react/core'
import { ConnectWalletButton } from './connect-wallet-button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip'
import { Button } from './ui/button'
import { AccountInfo } from '@/app/account-info'

export const Header = () => {
  const { address } = useAccount()
  return (
    <div className='fixed top-0 flex w-full items-center justify-between px-3 py-2'>
      <Link href='/'>
        <Home size={24} />
      </Link>
      <div className='flex gap-x-2'>
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button className='opacity-50' icon={<Plus />}>
                Register your crew
              </Button>
            </TooltipTrigger>
            <TooltipContent>Coming soon</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {!address && <ConnectWalletButton />}
        {address && <AccountInfo address={address} />}
      </div>
    </div>
  )
}
