'use client'

import { DialogTitle } from '@radix-ui/react-dialog'
import { useConnect } from '@starknet-react/core'
import { User } from 'lucide-react'
import { WalletIcon } from './wallet-icon'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button, ButtonProps } from '@/components/ui/button'

export const ConnectWalletButton = (props: ButtonProps) => {
  const { connectors, status, connect } = useConnect()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant='accent'
          loading={status === 'pending'}
          icon={<User />}
          {...props}
        >
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
        </DialogHeader>

        <div className='flex flex-col gap-2'>
          {connectors
            .filter((connector) => connector.available())
            .map((connector) => (
              <Button
                key={connector.id}
                className='gap-x-3'
                onClick={() => connect({ connector })}
              >
                <WalletIcon icon={connector.icon} />
                {connector.name}
              </Button>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
