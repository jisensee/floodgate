import { O, pipe } from '@mobily/ts-belt'
import { MapPin } from 'lucide-react'

export type LocationProps = {
  stationName?: string
  asteroidName: string
}

export const Location = ({ stationName, asteroidName }: LocationProps) => (
  <div className='flex items-center gap-x-1 text-sm'>
    <MapPin />
    {pipe(
      stationName,
      O.mapWithDefault('', (name) => `${name}, `)
    ) + asteroidName}
  </div>
)
