import { SquareArrowDown } from 'lucide-react'
import { SwayAmount } from './sway-amount'
import { Button } from './ui/button'
import { useWithdrawFees } from '@/hooks/contract'
import { useTransactionToast } from '@/hooks/transaction-toast'

export const FeeBalance = ({ balance }: { balance: bigint }) => {
  const { write: withdraw, data, status, error } = useWithdrawFees(balance)
  const { isLoading } = useTransactionToast({
    txHash: data?.transaction_hash,
    submitStatus: status,
    submitError: error,
    successMessage: 'Fees withdrawn!',
    pendingMessage: 'Withdrawing fees...',
  })

  return (
    <div className='flex w-full flex-col items-center gap-y-2 p-3'>
      <div className='flex items-center gap-x-3'>
        <p className='font-bold'>Floodgate balance</p>
      </div>
      <SwayAmount amount={balance} convert />
      <Button
        variant='accent'
        loading={isLoading}
        onMouseDown={() => withdraw()}
        icon={<SquareArrowDown />}
      >
        Withdraw
      </Button>
    </div>
  )
}
