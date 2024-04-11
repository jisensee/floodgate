'use client'

import NextImage from 'next/image'
import { DialogTitle } from '@radix-ui/react-dialog'
import { useConnect } from '@starknet-react/core'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export const ConnectWalletButton = () => {
  const { connect, connectors, status } = useConnect()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button disabled={status === 'pending'}>Connect Wallet</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
        </DialogHeader>

        <div className='flex flex-col gap-2'>
          {connectors.map((connector) => (
            <Button
              key={connector.id}
              className='gap-x-3'
              onClick={() => connect({ connector })}
            >
              {connector.icon.dark && (
                <NextImage
                  src={connector.icon.dark}
                  width={24}
                  height={24}
                  alt=''
                />
              )}
              {connector.name}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
