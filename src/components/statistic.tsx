import { CrewBonuses, cn } from '@/lib/utils'

export type StatisticProps = {
  value: number
  label: string
}

export const Statistic = ({ value, label }: StatisticProps) => (
  <>
    <span
      className={cn('text-xl md:text-2xl', {
        'text-success': value >= 0,
        'text-destructive': value < 0,
      })}
    >
      {Math.round(value)}%
    </span>
    <span className='text-sm text-muted-foreground'>{label}</span>
  </>
)

export type CrewBonusStatisticsProps = {
  bonuses: CrewBonuses
}
export const CrewBonusStatistics = ({ bonuses }: CrewBonusStatisticsProps) => (
  <>
    <Statistic
      value={(bonuses.transportTime.totalBonus - 1) * 100}
      label='faster transport'
    />
    <Statistic
      value={(bonuses.volumeCapacity.totalBonus - 1) * 100}
      label='more volume'
    />
    <Statistic
      value={(bonuses.massCapacity.totalBonus - 1) * 100}
      label='more mass'
    />
  </>
)
