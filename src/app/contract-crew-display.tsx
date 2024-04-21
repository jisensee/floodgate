'use client'

import { FC } from 'react'
import { useContractCrew } from '@/hooks/contract'
import { Skeleton } from '@/components/ui/skeleton'
import { CrewmateImage } from '@/components/asset-images'
import { cn } from '@/lib/utils'

export const ContractCrewDisplay = () => {
  const { crewData, isLoading } = useContractCrew()

  return (
    <div>
      {isLoading && (
        <div className='flex flex-col items-center gap-y-2'>
          <div className='flex flex-wrap justify-center gap-1'>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className='h-[133px] w-[100px]' />
            ))}
          </div>
          <Skeleton className='h-8 w-44' />
          <div className='grid grid-cols-2 gap-3'>
            <Skeleton className='h-16 w-32' />
            <Skeleton className='h-16 w-32' />
          </div>
        </div>
      )}
      {crewData && (
        <div className='flex flex-col items-center gap-y-2'>
          <div className='flex flex-wrap justify-center gap-1'>
            {crewData.crew.Crew?.roster?.map((id) => (
              <CrewmateImage key={id} crewmateId={id} width={100} />
            ))}
          </div>
          <h2>{crewData.crew.Name}</h2>
          <div className='grid grid-cols-2 gap-3'>
            <CrewStatistic
              value={(crewData.bonuses.transportTimeBonus.totalBonus - 1) * 100}
              label='faster transport'
            />
            <CrewStatistic
              value={(crewData.bonuses.volumeBonus.totalBonus - 1) * 100}
              label='more volume'
            />
          </div>
        </div>
      )}
    </div>
  )
}

type CrewStatisticProps = {
  value: number
  label: string
}

const CrewStatistic: FC<CrewStatisticProps> = ({ value, label }) => (
  <div className='flex flex-col items-center rounded-md border border-primary px-2 py-1'>
    <span
      className={cn('text-3xl', {
        'text-sucess': value >= 0,
        'text-destructive': value < 0,
      })}
    >
      {Math.round(value)}%
    </span>
    <span className='text-sm text-muted-foreground'>{label}</span>
  </div>
)
