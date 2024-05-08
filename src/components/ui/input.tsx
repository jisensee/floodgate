import * as React from 'react'

import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  leadingIcon?: React.ReactNode
  inputClassName?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, inputClassName, type, leadingIcon, ...props }, ref) => {
    return (
      <div className={cn('flex h-full w-full', className)}>
        {leadingIcon && (
          <div className='flex rounded-l-md border border-border p-1'>
            {leadingIcon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            {
              'rounded-l-none': leadingIcon,
            },
            inputClassName
          )}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
