'use client'

import { useAccount } from '@starknet-react/core'
import { CrewManagement } from './crew-management'
import { CrewImages } from '@/components/asset-images'
import { FloodgateCrew } from '@/lib/contract-types'
import { CrewBonusStatistics } from '@/components/statistic'
import { Separator } from '@/components/ui/separator'
import { ServiceButton } from '@/components/service-button'

export type CrewDetailsProps = {
  crew: FloodgateCrew
}
export const CrewDetails = ({ crew }: CrewDetailsProps) => {
  const { address } = useAccount()
  const isManager = address && BigInt(address) === crew.managerAddress

  return (
    <div className='flex flex-col items-center gap-y-3'>
      <CrewImages crewmateIds={crew.crewmateIds} width={100} />
      <div className='grid grid-cols-[min-content,1fr] items-center gap-x-2'>
        <CrewBonusStatistics bonuses={crew.bonuses} />
      </div>
      {crew.services.map((service) => (
        <ServiceButton
          key={service.serviceType}
          service={service}
          crewId={crew.id}
          crewLocked={crew.locked}
        />
      ))}
      {isManager && (
        <>
          <Separator />
          <h2>Management</h2>
          <CrewManagement crew={crew} />
        </>
      )}
    </div>
  )
}
