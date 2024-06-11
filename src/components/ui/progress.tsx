'use client'

import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'

import { A, D, pipe } from '@mobily/ts-belt'
import { cn } from '@/lib/utils'

export type ProgressIndicator = {
  position?: number
  value: number
  className?: string
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  Omit<
    React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    'value'
  > & {
    indicators: ProgressIndicator[]
  }
>(({ className, indicators, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      'relative h-4 w-full overflow-hidden rounded bg-border',
      className
    )}
    {...props}
  >
    {pipe(
      indicators,
      A.sortBy(D.prop('position')),
      A.map((indicator) => (
        <ProgressPrimitive.Indicator
          key={indicator.position ?? 1}
          className={cn(
            'absolute left-0 h-full w-full flex-1 bg-white transition-all',
            indicator.className
          )}
          style={{ transform: `translateX(-${100 - indicator.value}%)` }}
        />
      ))
    )}
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
