import { Fuel, Truck } from 'lucide-react'
import Link from 'next/link'
import { Button } from './ui/button'
import { SwayAmount } from './sway-amount'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip'
import { FloodgateService, FloodgateServiceType } from '@/lib/contract-types'
import { cn } from '@/lib/utils'

export type ServiceButtonProps = {
  className?: string
  service: FloodgateService
  crewId: number
  crewLocked: boolean
}

export const ServiceButton = ({
  className,
  service,
  crewId,
  crewLocked,
}: ServiceButtonProps) => {
  if (!service.enabled) return null

  const { icon, name, link } = getServiceData(service.serviceType, crewId)
  const button = (
    <Button disabled={crewLocked} icon={icon}>
      {name}
      <SwayAmount amount={service.actionSwayFee} convert />
    </Button>
  )

  return crewLocked ? (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className={cn('cursor-not-allowed', className)}>
          {button}
        </TooltipTrigger>
        <TooltipContent>
          This crew is currently locked and can not perform actions.
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    <Link className={className} href={link}>
      {button}
    </Link>
  )
}

const getServiceData = (serviceType: FloodgateServiceType, crewId: number) => {
  switch (serviceType) {
    case 'RefuelShip':
      return {
        icon: <Fuel />,
        name: 'Fuel Ship',
        link: `/action/${crewId}/refuel` as const,
      }
    case 'TransportGoods':
      return {
        icon: <Truck />,
        name: 'Transport Goods',
        link: `/action/${crewId}/refuel` as const,
      }
  }
}
