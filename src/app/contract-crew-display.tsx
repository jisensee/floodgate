'use client'

import { FC } from 'react'
import { Fuel, MapPin } from 'lucide-react'
import Link from 'next/link'
import { CrewmateImage } from '@/components/asset-images'
import { cn } from '@/lib/utils'
import { ContractCrew } from '@/lib/contract'
import { Button } from '@/components/ui/button'
import { SwayAmount } from '@/components/sway-amount'

export type ContractCrewDisplayProps = {
  crew: ContractCrew
}

export const ContractCrewDisplay = ({ crew }: ContractCrewDisplayProps) => {
  const captainId = crew.crewmateIds[0] ?? 0
  const memberIds = crew.crewmateIds.slice(1)

  const stats = (
    <>
      <CrewStatistic
        value={(crew.bonuses.transportTime.totalBonus - 1) * 100}
        label='faster transport'
      />
      <CrewStatistic
        value={(crew.bonuses.volumeCapacity.totalBonus - 1) * 100}
        label='more volume'
      />
      <CrewStatistic
        value={(crew.bonuses.massCapacity.totalBonus - 1) * 100}
        label='more mass'
      />
    </>
  )

  return (
    <div className='flex flex-col items-center gap-y-2 rounded-md border border-primary p-3'>
      <div className='flex gap-x-2'>
        <CrewmateImage crewmateId={captainId} width={150} />
        <div className='flex flex-col justify-between'>
          <div className='flex flex-wrap items-center gap-3 pr-2'>
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
            {stats}
          </div>
          <FuelLink crewId={crew.id} className='w-full md:hidden' />
        </div>

        <div className='hidden flex-col gap-y-1 md:flex'>
          <FuelLink crewId={crew.id} className='hidden w-full md:block' />
          <div className='hidden grid-cols-[min-content,1fr] items-center gap-x-1 md:grid'>
            {stats}
          </div>
        </div>
      </div>
    </div>
  )
}

type CrewStatisticProps = {
  value: number
  label: string
}

const CrewStatistic: FC<CrewStatisticProps> = ({ value, label }) => (
  <>
    <span
      className={cn('text-2xl', {
        'text-success': value >= 0,
        'text-destructive': value < 0,
      })}
    >
      {Math.round(value)}%
    </span>
    <span className='text-sm text-muted-foreground'>{label}</span>
  </>
)

type FuelLinkProps = {
  crewId: number
  className?: string
}

const FuelLink = ({ crewId, className }: FuelLinkProps) => (
  <Link href={`/action/${crewId}/refuel`} className={className}>
    <Button size='lg' className='w-full gap-x-1'>
      <Fuel />
      Fuel Ship
    </Button>
  </Link>
)
