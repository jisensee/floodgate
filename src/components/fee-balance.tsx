import Link from 'next/link'
import { SwayAmount } from './sway-amount'
import { Button } from './ui/button'

export const FeeBalance = ({
  balance,
  onClick,
}: {
  balance: bigint
  onClick: () => void
}) => {
  return (
    <div className='flex w-full flex-col items-center gap-y-2 p-3'>
      <div className='flex items-center gap-x-3'>
        <p className='font-bold'>Floodgate balance</p>
      </div>
      <Link href='/withdraw' onClick={onClick}>
        <Button className='gap-x-1' variant='accent'>
          Withdraw
          <SwayAmount amount={balance} convert />
        </Button>
      </Link>
    </div>
  )
}
