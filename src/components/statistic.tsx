import { ReactNode } from 'react'
import { Box, Truck, Weight } from 'lucide-react'
import { StandardTooltip } from './ui/tooltip'
import { Badge } from './ui/badge'
import { CrewBonuses, cn } from '@/lib/utils'

export type StatisticProps = {
  value: number
  label: string
  icon: ReactNode
}

export const Statistic = ({ value, label, icon }: StatisticProps) => (
  <StandardTooltip content={label}>
    <Badge className='flex items-center gap-x-2' variant='outline'>
      <span
        className={cn('text-xl', {
          'text-success': value >= 0,
          'text-destructive': value < 0,
        })}
      >
        {Math.round(value)}%
      </span>
      {icon}
    </Badge>
  </StandardTooltip>
)

export type CrewBonusStatisticsProps = {
  bonuses: CrewBonuses
}
export const CrewBonusStatistics = ({ bonuses }: CrewBonusStatisticsProps) => (
  <>
    <Statistic
      value={(bonuses.transportTime.totalBonus - 1) * 100}
      label='Bonus transport speed'
      icon={<Truck />}
    />
    <Statistic
      value={(bonuses.volumeCapacity.totalBonus - 1) * 100}
      label='Bonus volume capacity'
      icon={<Box />}
    />
    <Statistic
      value={(bonuses.massCapacity.totalBonus - 1) * 100}
      label='Bonus mass capacity'
      icon={<Weight />}
    />
  </>
)
