import NextLink from 'next/link'
import { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export const Link = (props: ComponentProps<typeof NextLink>) => (
  <NextLink
    {...props}
    className={cn(
      'font-bold text-primary hover:text-secondary',
      props.className
    )}
  />
)
