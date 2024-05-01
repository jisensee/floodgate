import { Connector, useBalance, useDisconnect } from '@starknet-react/core'
import NextImage from 'next/image'
import { FC, useEffect, useState } from 'react'
import { SwayAmount } from '@/components/sway-amount'
import { Address } from '@/components/address'
import { env } from '@/env'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog'

type AccountInfoProps = {
  address: string
  connector: Connector
}

export const AccountInfo: FC<AccountInfoProps> = ({ address, connector }) => {
  const [open, setOpen] = useState(false)
  const { disconnect, status: disconnectStatus } = useDisconnect()
  const { data } = useBalance({
    address,
    token: env.NEXT_PUBLIC_SWAY_CONTRACT_ADDRESS,
  })

  useEffect(() => {
    if (disconnectStatus === 'success') {
      setOpen(false)
    }
  }, [disconnectStatus])

  const swayBalance = data ? parseFloat(data.formatted) : undefined

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant='outline'
          className='flex flex-row items-center gap-x-3 border-primary'
          size='sm'
        >
          {swayBalance && (
            <>
              <SwayAmount amount={swayBalance} />|
            </>
          )}
          <Address address={address} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogHeader>
            <div className='flex items-center gap-x-2 text-2xl'>
              {connector.icon.dark && (
                <NextImage
                  src={connector.icon.dark}
                  width={24}
                  height={24}
                  alt={connector.name}
                />
              )}
              <span>Connected {connector.name} Account</span>
            </div>
          </DialogHeader>
        </DialogHeader>
        <p className='break-all'>{address}</p>
        {swayBalance && (
          <div className='flex items-center gap-x-2'>
            <span>Balance:</span>
            <SwayAmount amount={swayBalance} />
          </div>
        )}
        <Button
          variant='destructive'
          onClick={() => disconnect()}
          loading={disconnectStatus === 'pending'}
        >
          Disconnect
        </Button>
      </DialogContent>
    </Dialog>
  )
}
