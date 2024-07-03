import { Route } from 'next'
import Link from 'next/link'
import { ReactNode } from 'react'
import { Lock } from 'lucide-react'
import { CrewImages } from './asset-images'
import { Location } from './location'
import { CrewBonusStatistics } from './statistic'
import { SwayAmount } from './sway-amount'
import { StandardTooltip } from './ui/tooltip'
import { FoodStatus } from './food-status'
import { CrewBonuses, cn } from '@/lib/utils'

export type CrewCardProps = {
  crew: {
    id: number
    name: string
    currentFoodRatio: number
    crewmateIds: number[]
    asteroidId: number
    asteroidName: string
    stationName?: string
    bonuses: CrewBonuses
    locked?: boolean
    managerAddress?: bigint
    ownerAddress?: bigint
  }
  href?: Route
  swayFee?: bigint
  actions?: ReactNode
  connectedAddress?: string
}

export const CrewCard = ({
  crew,
  href,
  swayFee,
  actions,
  connectedAddress,
}: CrewCardProps) => {
  const isManagerOrOwner =
    connectedAddress &&
    [crew.managerAddress, crew.ownerAddress].includes(BigInt(connectedAddress))
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
          <div className='flex w-full flex-row items-center justify-between gap-x-3'>
            <p className='text-lg md:text-xl'>{crew.name}</p>
            <div className='flex gap-x-3'>
              {isManagerOrOwner && (
                <FoodStatus foodRatio={crew.currentFoodRatio} />
              )}
              {crew.locked && (
                <StandardTooltip content='This crew is currently locked.'>
                  <Lock className='text-warning' />
                </StandardTooltip>
              )}
            </div>
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
  return (
    <Link className='w-full' href={href ?? `/crews/${crew.id}`}>
      {card}
    </Link>
  )
}
