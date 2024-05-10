import { Fuel, Truck } from 'lucide-react'
import Link from 'next/link'
import { Route } from 'next'
import { Button } from './ui/button'
import { SwayAmount } from './sway-amount'
import { StandardTooltip } from './ui/tooltip'
import {
  FloodgateCrew,
  FloodgateService,
  FloodgateServiceType,
} from '@/lib/contract-types'

export type ServiceButtonProps = {
  className?: string
  service: FloodgateService
  crew: FloodgateCrew
}

export const ServiceButton = ({
  className,
  service,
  crew,
}: ServiceButtonProps) => {
  if (!service.enabled) return null

  const { icon, name, link } = getServiceData(service.serviceType, crew)
  const button = (
    <Button disabled={crew.locked} icon={icon}>
      {name}
      <SwayAmount amount={service.actionSwayFee} convert />
    </Button>
  )

  return crew.locked ? (
    <StandardTooltip content='This crew is currently locked and can not perform actions.'>
      {button}
    </StandardTooltip>
  ) : (
    <Link className={className} href={link as Route}>
      {button}
    </Link>
  )
}

export const getServiceData = (
  serviceType: FloodgateServiceType,
  crew?: FloodgateCrew
) => {
  switch (serviceType) {
    case 'RefuelShip':
      return {
        icon: <Fuel />,
        name: 'Fuel Ship',
        description:
          'Fuel up your ship, potentially going over the fuel capacity depending on crew bonuses.',
        link: crew
          ? (`/${serviceType}/${crew.asteroidId}/${crew.id}` as const)
          : `/${serviceType}`,
      }
    case 'TransportGoods':
      return {
        icon: <Truck />,
        name: 'Transport Goods',
        description:
          'Transport goods from one location to another, potentially going over the storage capacity depending on crew bonuses.',
        link: crew
          ? (`/${serviceType}/${crew.asteroidId}/${crew.id}` as const)
          : (`/${serviceType}` as const),
      }
  }
}
