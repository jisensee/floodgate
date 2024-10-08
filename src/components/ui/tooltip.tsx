'use client'

import * as React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'

import { PropsWithChildren } from 'react'
import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      'z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

type StandardTooltipProps = {
  content: React.ReactNode
  side?: TooltipPrimitive.TooltipContentProps['side']
  withDelay?: boolean
} & React.PropsWithChildren

const StandardTooltip = ({
  content,
  side,
  withDelay,
  children,
}: StandardTooltipProps) => (
  <TooltipProvider delayDuration={withDelay ? 500 : 0}>
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side}>{content}</TooltipContent>
    </Tooltip>
  </TooltipProvider>
)

const InfoTooltip = ({
  children,
  side,
  size,
}: {
  size?: number
  side?: TooltipPrimitive.TooltipContentProps['side']
} & PropsWithChildren) => (
  <StandardTooltip
    content={<div className='max-w-64'>{children}</div>}
    side={side}
  >
    <Info size={size} />
  </StandardTooltip>
)

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  StandardTooltip,
  InfoTooltip,
  type StandardTooltipProps,
}
