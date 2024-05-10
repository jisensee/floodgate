'use client'

import { MapPin, Search } from 'lucide-react'
import Link from 'next/link'
import { CrewmateImage } from '@/components/asset-images'
import { FloodgateCrew } from '@/lib/contract-types'
import { CrewBonusStatistics } from '@/components/statistic'
import { Button } from '@/components/ui/button'

export type ContractCrewDisplayProps = {
  crew: FloodgateCrew
}

export const ContractCrewDisplay = ({ crew }: ContractCrewDisplayProps) => {
  const captainId = crew.crewmateIds[0] ?? 0

  return (
    <div className='flex w-full gap-x-3 rounded-md border border-primary p-3'>
      <CrewmateImage crewmateId={captainId} width={150} />
      <div className='flex flex-col justify-between gap-y-2'>
        <div className='flex flex-wrap items-center gap-x-3 gap-y-1 pr-2'>
          <h2 className='grow'>{crew.name}</h2>
          <div className='flex items-center gap-x-1 text-sm'>
            <MapPin />
            {crew.asteroidName}
          </div>
        </div>
        <div className='flex flex-wrap gap-2'>
          <CrewBonusStatistics bonuses={crew.bonuses} />
        </div>
        <Link href={`/crews/${crew.id}`}>
          <Button icon={<Search />}>View Crew</Button>
        </Link>
      </div>
    </div>
  )
}
