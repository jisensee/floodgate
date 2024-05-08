'use client'

import { MapPin } from 'lucide-react'
import { CrewmateImage } from '@/components/asset-images'
import { FloodgateCrew } from '@/lib/contract-types'
import { CrewBonusStatistics } from '@/components/statistic'
import { ServiceButton } from '@/components/service-button'

export type ContractCrewDisplayProps = {
  crew: FloodgateCrew
}

export const ContractCrewDisplay = ({ crew }: ContractCrewDisplayProps) => {
  const captainId = crew.crewmateIds[0] ?? 0
  const memberIds = crew.crewmateIds.slice(1)

  return (
    <div className='flex flex-col items-center gap-y-2 rounded-md border border-primary p-3'>
      <div className='flex gap-x-2'>
        <CrewmateImage crewmateId={captainId} width={150} />
        <div className='flex flex-col justify-between'>
          <div className='flex flex-wrap items-center gap-x-3 gap-y-1 pr-2'>
            <h2 className='grow'>{crew.name}</h2>
            <div className='flex items-center gap-x-1 text-sm'>
              <MapPin />
              {crew.asteroidName}
            </div>
          </div>
          <div className='hidden gap-x-1 md:flex'>
            {memberIds.map((id) => (
              <CrewmateImage key={id} crewmateId={id} width={125} />
            ))}
          </div>
          <div className='grid grid-cols-[min-content,1fr] items-center gap-x-1 md:hidden'>
            <CrewBonusStatistics bonuses={crew.bonuses} />
          </div>
          <FuelLink crew={crew} className='w-full md:hidden' />
        </div>

        <div className='hidden flex-col gap-y-3 md:flex'>
          <FuelLink crew={crew} className='hidden w-full md:block' />
          <div className='hidden grid-cols-[min-content,1fr] items-center gap-x-1 md:grid'>
            <CrewBonusStatistics bonuses={crew.bonuses} />
          </div>
        </div>
      </div>
    </div>
  )
}

type FuelLinkProps = {
  className?: string
  crew: FloodgateCrew
}

const FuelLink = ({ crew, className }: FuelLinkProps) => {
  const fuelService = crew.services.find(
    (service) => service.serviceType === 'RefuelShip'
  )
  return fuelService ? (
    <ServiceButton
      className={className}
      crewLocked={crew.locked}
      crewId={crew.id}
      service={fuelService}
    />
  ) : null
}
