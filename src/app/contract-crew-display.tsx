'use client'

import NextImage from 'next/image'
import { useContractCrew } from '@/hooks/contract'
import { crewmateImageUrl } from '@/lib/image-urls'
import { Skeleton } from '@/components/ui/skeleton'

export const ContractCrewDisplay = () => {
  const { crewData, isLoading } = useContractCrew()

  return (
    <div>
      {isLoading && (
        <div className='flex flex-col items-center gap-y-2'>
          <div className='flex flex-row gap-x-2'>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className='h-[100px] w-[75px]' />
            ))}
          </div>
          <Skeleton className='h-8 w-44' />
        </div>
      )}
      {crewData && (
        <div className='flex flex-col items-center gap-y-2'>
          <div className='flex justify-center gap-x-1'>
            {crewData.crew.Crew?.roster?.map((id) => (
              <NextImage
                className='rounded border border-border'
                key={id}
                src={crewmateImageUrl(id)}
                alt='crewmate'
                width={75}
                height={100}
              />
            ))}
          </div>
          <h2>{crewData.crew.Name}</h2>
        </div>
      )}
    </div>
  )
}
