'use client'

import { useAccount } from '@starknet-react/core'
import Link from 'next/link'
import { Cog } from 'lucide-react'
import { CrewImages } from '@/components/asset-images'
import { FloodgateCrew } from '@/lib/contract-types'
import { CrewBonusStatistics } from '@/components/statistic'
import { ServiceButton } from '@/components/service-button'
import { Button } from '@/components/ui/button'

export type CrewDetailsProps = {
  crew: FloodgateCrew
  showServices?: boolean
  showManageButton?: boolean
}
export const CrewDetails = ({
  crew,
  showServices,
  showManageButton,
}: CrewDetailsProps) => {
  const { address } = useAccount()
  const isManager = address && BigInt(address) === crew.managerAddress

  return (
    <div className='flex flex-col items-center gap-y-5'>
      <CrewImages crewmateIds={crew.crewmateIds} width={100} />
      <div className='flex flex-wrap gap-2'>
        <CrewBonusStatistics bonuses={crew.bonuses} />
      </div>
      {showServices &&
        crew.services.map((service) => (
          <ServiceButton
            key={service.serviceType}
            service={service}
            crew={crew}
          />
        ))}
      {isManager && showManageButton && (
        <Link href={`/crews/${crew.id}/manage`}>
          <Button variant='secondary' icon={<Cog />}>
            Manage Crew
          </Button>
        </Link>
      )}
    </div>
  )
}
