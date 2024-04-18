import NextImage from 'next/image'
import { FC } from 'react'
import { cn } from '@/lib/utils'

type SwayAmountProps = {
  className?: string
  amount: number
}

export const SwayAmount: FC<SwayAmountProps> = ({ className, amount }) => {
  return (
    <div className={cn('flex items-center gap-x-1', className)}>
      <span>{Math.round(amount).toLocaleString()}</span>
      <NextImage src='/sway-logo.png' alt='SWAY logo' width={24} height={24} />
    </div>
  )
}
