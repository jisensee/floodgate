import NextImage from 'next/image'
import { FC } from 'react'
import { cn } from '@/lib/utils'

type SwayAmountProps = {
  className?: string
  amount: number | bigint
  convert?: boolean
}

export const SwayAmount: FC<SwayAmountProps> = ({
  className,
  amount,
  convert,
}) => {
  return (
    <div className={cn('flex items-center gap-x-1', className)}>
      <NextImage src='/sway-logo.png' alt='SWAY logo' width={24} height={24} />
      <span>
        {Math.round(
          convert ? Number(BigInt(amount) / 1_000_000n) : Number(amount)
        ).toLocaleString()}
      </span>
    </div>
  )
}
