'use client'

import { useEffect, useState } from 'react'
import { N, pipe } from '@mobily/ts-belt'
import { Download } from 'lucide-react'
import { P, match } from 'ts-pattern'
import {
  useDevteamWithdraw,
  useFeeBalance,
  useWithdrawFees,
} from '@/hooks/contract'
import { useTransactionToast } from '@/hooks/transaction-toast'
import { RequireConnectedAccount } from '@/components/require-connected-account'
import { SwayAmount } from '@/components/sway-amount'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

export const Withdraw = () => (
  <RequireConnectedAccount>
    {(address) => <Wrapper address={address} />}
  </RequireConnectedAccount>
)

const Wrapper = ({ address }: { address: string }) => {
  const [withdrawAmount, setWithdrawAmount] = useState(0n)
  const {
    feeBalance,
    devteamBalance: [devteamBalance, devteamIndex],
  } = useFeeBalance(address)

  useEffect(() => {
    if (feeBalance) {
      setWithdrawAmount(feeBalance)
    }
  }, [feeBalance])

  const {
    send: withdraw,
    data,
    status,
    error,
  } = useWithdrawFees(withdrawAmount)

  const { send: withdrawDevteam, isPending: devteamWithdrawLoading } =
    useDevteamWithdraw(devteamBalance, devteamIndex)

  const { isLoading } = useTransactionToast({
    txHash: data?.transaction_hash,
    submitStatus: status,
    submitError: error,
    successMessage: 'Balance withdrawn!',
    pendingMessage: 'Withdrawing balance...',
  })

  const normalFees = match<bigint | undefined>(feeBalance)
    .with(P.nullish, () => (
      <div className='flex flex-col items-center gap-y-2'>
        <Skeleton className='h-6 w-60' />
        <Skeleton className='h-7 w-32' />
        <Skeleton className='h-9 w-48' />
        <Skeleton className='h-7 w-24' />
      </div>
    ))
    .with(0n, () => <div>You have no fees to withdraw yet</div>)
    .otherwise((balance) => (
      <div className='flex flex-col items-center gap-y-5'>
        <div className='flex flex-col items-center gap-y-1'>
          <h2>Available amount to withdraw:</h2>
          <h1>
            <SwayAmount amount={balance} convert logoSize={36} />
          </h1>
        </div>
        <div className='flex flex-col items-center gap-y-1'>
          <Label className='text-xs font-bold'>
            Customize withdrawal amount
          </Label>
          <Input
            className='w-48'
            type='number'
            min={1}
            max={Number(balance / BigInt(1e6))}
            value={(withdrawAmount / BigInt(1e6)).toString()}
            onChange={(e) =>
              pipe(
                e.target.value,
                parseInt,
                N.multiply(1e6),
                BigInt,
                setWithdrawAmount
              )
            }
          />
        </div>
        <Button
          variant='accent'
          icon={<Download />}
          loading={isLoading}
          onClick={() => withdraw()}
        >
          Withdraw
        </Button>
      </div>
    ))

  return (
    <div className='flex flex-col items-center gap-y-3'>
      {normalFees}
      {devteamIndex !== 0 && devteamBalance > 0n && (
        <div className='flex flex-col items-center gap-y-3'>
          <Separator />
          <h2>Devteam share to withdraw</h2>
          <Button
            className='gap-x-2'
            variant='accent'
            onClick={() => withdrawDevteam()}
            loading={devteamWithdrawLoading}
          >
            Withdraw <SwayAmount amount={devteamBalance} convert />
          </Button>
        </div>
      )}
    </div>
  )
}
