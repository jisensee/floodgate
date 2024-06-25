import { Route } from 'next'
import Link from 'next/link'
import { ReactNode } from 'react'
import { Lock } from 'lucide-react'
import { CrewImages } from './asset-images'
import { Location } from './location'
import { CrewBonusStatistics } from './statistic'
import { SwayAmount } from './sway-amount'
import { StandardTooltip } from './ui/tooltip'
import { FloodgateCrew } from '@/lib/contract-types'
import { cn } from '@/lib/utils'

export type CrewCardProps = {
  crew: {
    id: number
    name: string
    stationName?: string
    asteroidName: string
    crewmateIds: number[]
    locked?: boolean
    bonuses: FloodgateCrew['bonuses']
  }
  href?: Route
  swayFee?: bigint
  actions?: ReactNode
}

export const CrewCard = ({ crew, href, swayFee, actions }: CrewCardProps) => {
  const card = (
    <div
      className={cn(
        'flex w-full flex-col gap-y-2 rounded-md p-2 ring-1 hover:ring-2'
      )}
    >
      <div className={'flex w-full flex-row items-start gap-x-3'}>
        <CrewImages
          className='hidden md:flex'
          crewmateIds={crew.crewmateIds}
          width={125}
          onlyCaptain
        />
        <CrewImages
          className='md:hidden'
          crewmateIds={crew.crewmateIds}
          width={75}
          onlyCaptain
        />
        <div className='flex w-full flex-col gap-y-1'>
          <div className='flex w-full flex-row items-center justify-between'>
            <p className='text-lg md:text-xl'>{crew.name}</p>
            {crew.locked && (
              <StandardTooltip content='This crew is currently locked.'>
                <Lock className='text-warning' />
              </StandardTooltip>
            )}
          </div>
          <Location
            stationName={crew.stationName}
            asteroidName={crew.asteroidName}
          />
          {swayFee !== undefined && <SwayAmount amount={swayFee} convert />}
          <div className='hidden flex-wrap gap-2 md:flex'>
            <CrewBonusStatistics bonuses={crew.bonuses} />
          </div>
          {actions && <div className='hidden md:flex'>{actions}</div>}
        </div>
      </div>
      <div className='flex flex-wrap gap-2 md:hidden'>
        <CrewBonusStatistics bonuses={crew.bonuses} />
      </div>
      {actions && <div className='flex md:hidden'>{actions}</div>}
    </div>
  )
  // return href ? <Link href={href}>{card}</Link> : card
  return <Link href={href ?? `/crews/${crew.id}`}>{card}</Link>
}
