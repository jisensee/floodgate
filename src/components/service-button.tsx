import { Fuel, Truck } from 'lucide-react'
import Link from 'next/link'
import { Route } from 'next'
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
    <Link className={className} href={link as Route}>
      {button}
    </Link>
  )
}

export const getServiceData = (
  serviceType: FloodgateServiceType,
  crewId?: number
) => {
  switch (serviceType) {
    case 'RefuelShip':
      return {
        icon: <Fuel />,
        name: 'Fuel Ship',
        description:
          'Fuel up your ship, potentially going over the fuel capacity depending on crew bonuses.',
        link: crewId
          ? (`/action/${crewId}/refuel` as const)
          : `/${serviceType}`,
      }
    case 'TransportGoods':
      return {
        icon: <Truck />,
        name: 'Transport Goods',
        description:
          'Transport goods from one location to another, potentially going over the storage capacity depending on crew bonuses.',
        link: crewId
          ? (`/action/${crewId}/refuel` as const)
          : (`/${serviceType}` as const),
      }
  }
}
