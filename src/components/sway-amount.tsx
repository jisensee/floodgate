import NextImage from 'next/image'
import { cn } from '@/lib/utils'

type SwayAmountProps = {
  className?: string
  amount: number | bigint
  convert?: boolean
  logoSize?: number
}

export const SwayAmount = ({
  className,
  amount,
  convert,
  logoSize = 24,
}: SwayAmountProps) => {
  return (
    <div className={cn('flex items-center gap-x-1', className)}>
      <NextImage
        src='/sway-logo.png'
        alt='SWAY logo'
        width={logoSize}
        height={logoSize}
      />
      <span>
        {Math.round(
          convert ? Number(BigInt(amount) / 1_000_000n) : Number(amount)
        ).toLocaleString()}
      </span>
    </div>
  )
}
