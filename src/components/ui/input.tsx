import * as React from 'react'

import { X } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  leadingIcon?: React.ReactNode
  endIcon?: React.ReactNode
  inputClassName?: string
  onClear?: () => void
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      inputClassName,
      type,
      leadingIcon,
      endIcon,
      onClear,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn('relative flex h-full w-full', className)}>
        {leadingIcon && (
          <div className='absolute inset-y-0 left-2 flex'>{leadingIcon}</div>
        )}
        {endIcon && (
          <div className='absolute inset-y-0 right-2 flex items-center'>
            {endIcon}
          </div>
        )}
        {onClear && (
          <Button
            className='absolute inset-y-0 right-1 flex items-center hover:bg-transparent hover:text-primary'
            variant='ghost'
            onClick={onClear}
          >
            <X />
          </Button>
        )}
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            { 'pl-10': leadingIcon },
            { 'pr-10': endIcon },
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
