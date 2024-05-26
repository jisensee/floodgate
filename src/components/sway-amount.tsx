import NextImage from 'next/image'
import { cn } from '@/lib/utils'

type SwayAmountProps = {
  className?: string
  amount: number | bigint
  convert?: boolean
}

export const SwayAmount = ({ className, amount, convert }: SwayAmountProps) => {
  return (
    <div className={cn('flex items-center', className)}>
      <NextImage src='/sway-logo.png' alt='SWAY logo' width={24} height={24} />
      <span>
        {Math.round(
          convert ? Number(BigInt(amount) / 1_000_000n) : Number(amount)
        ).toLocaleString()}
      </span>
    </div>
  )
}
