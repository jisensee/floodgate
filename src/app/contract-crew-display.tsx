'use client'

import { Fuel, MapPin } from 'lucide-react'
import Link from 'next/link'
import { CrewmateImage } from '@/components/asset-images'
import { ContractCrew } from '@/lib/contract'
import { Button } from '@/components/ui/button'
import { SwayAmount } from '@/components/sway-amount'
import { CrewBonusStatistics } from '@/components/statistic'

export type ContractCrewDisplayProps = {
  crew: ContractCrew
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
            <SwayAmount amount={Number(crew.swayFee)} convert />
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
          <FuelLink crewId={crew.id} className='w-full md:hidden' />
        </div>

        <div className='hidden flex-col gap-y-3 md:flex'>
          <FuelLink crewId={crew.id} className='hidden w-full md:block' />
          <div className='hidden grid-cols-[min-content,1fr] items-center gap-x-1 md:grid'>
            <CrewBonusStatistics bonuses={crew.bonuses} />
          </div>
        </div>
      </div>
    </div>
  )
}

type FuelLinkProps = {
  crewId: number
  className?: string
}

const FuelLink = ({ crewId, className }: FuelLinkProps) => (
  <Link href={`/action/${crewId}/refuel`} className={className}>
    <Button className='w-full gap-x-1'>
      <Fuel />
      Fuel Ship
    </Button>
  </Link>
)
