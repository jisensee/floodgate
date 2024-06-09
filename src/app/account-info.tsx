import { Connector, useBalance, useDisconnect } from '@starknet-react/core'
import NextImage from 'next/image'
import { FC, useEffect, useState } from 'react'
import Link from 'next/link'
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
import { useAccountCrews } from '@/hooks/queries'
import { Separator } from '@/components/ui/separator'
import { useFeeBalance } from '@/hooks/contract'
import { FeeBalance } from '@/components/fee-balance'

type AccountInfoProps = {
  address: string
  connector: Connector
}

export const AccountInfo: FC<AccountInfoProps> = ({ address, connector }) => {
  const [open, setOpen] = useState(false)
  const { disconnect, status: disconnectStatus } = useDisconnect()
  const { data: swayBalance } = useBalance({
    address,
    watch: true,
    token: env.NEXT_PUBLIC_SWAY_CONTRACT_ADDRESS,
  })
  const { data: crews } = useAccountCrews(address)
  const feeBalance = useFeeBalance(address)

  const hasFeesToWithdraw = feeBalance !== undefined && feeBalance > 0n

  useEffect(() => {
    if (disconnectStatus === 'success') {
      setOpen(false)
    }
  }, [disconnectStatus])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant='outline'
          className='flex flex-row items-center gap-x-3 border-primary'
          size='sm'
        >
          {swayBalance && <SwayAmount amount={swayBalance.value} convert />}
          <Address address={address} shownCharacters={4} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <h2>My Account</h2>
        </DialogHeader>
        <div className='flex flex-col items-center gap-y-5 overflow-hidden'>
          <div className='flex w-full flex-col gap-y-2 rounded-md border border-border p-3'>
            <div className='flex w-full items-center gap-x-2 text-xl'>
              {connector.icon.dark && (
                <NextImage
                  src={connector.icon.dark}
                  width={24}
                  height={24}
                  alt={connector.name}
                />
              )}
              <p>Connected {connector.name} Account</p>
            </div>
            <Address address={address} />
          </div>
          {swayBalance && (
            <div className='flex flex-col items-center gap-y-1'>
              <p className='font-bold'>Wallet balance</p>
              <SwayAmount amount={swayBalance.value} convert />
            </div>
          )}
          {hasFeesToWithdraw && (
            <div className='flex w-6/12 flex-col gap-y-3'>
              <Separator />
              <FeeBalance balance={feeBalance} />
              <Separator />
            </div>
          )}
          <div className='flex w-6/12 flex-col items-center gap-y-5'>
            {crews && crews.length > 0 && (
              <>
                <Link
                  className='w-full'
                  href='/my-crews'
                  onClick={() => setOpen(false)}
                >
                  <Button className='w-full'>My Crews</Button>
                </Link>
                <Separator />
              </>
            )}
            <Button
              variant='destructive'
              onClick={() => disconnect()}
              loading={disconnectStatus === 'pending'}
            >
              Disconnect
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
