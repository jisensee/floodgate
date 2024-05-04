'use client'

import { InfluenceEntity } from 'influence-typed-sdk/api'
import { Cog, MapPin } from 'lucide-react'
import { useState } from 'react'
import { RequireConnectedAccount } from '@/components/require-connected-account'
import { getCrewBonuses } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useRegisterCrew } from '@/hooks/contract'
import { CrewmateImage } from '@/components/asset-images'
import { CrewBonusStatistics } from '@/components/statistic'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export type RegisterCrewFormProps = {
  crew: InfluenceEntity
  crewmates: InfluenceEntity[]
  station: InfluenceEntity
  asteroidName: string
}

export const RegisterCrewForm = (props: RegisterCrewFormProps) => (
  <RequireConnectedAccount>{() => <Form {...props} />}</RequireConnectedAccount>
)

const Form = ({
  crew,
  crewmates,
  station,
  asteroidName,
}: RegisterCrewFormProps) => {
  const bonuses = getCrewBonuses(crew, crewmates, station)
  const [fee, setFee] = useState(0)
  const { write } = useRegisterCrew(crew.id)
  return (
    <div className='flex flex-col items-center gap-y-8'>
      <div className='flex flex-col gap-y-1'>
        <div className='flex w-full flex-col items-center justify-between md:flex-row'>
          <h2>{crew.Name ?? crew.id}</h2>
          <div className='flex gap-x-2'>
            <MapPin />
            {station.Name ? station.Name + ', ' : ''}
            {asteroidName}
          </div>
        </div>
        <div className='flex flex-wrap justify-center gap-1'>
          {crewmates.map(({ id }) => (
            <>
              <CrewmateImage
                className='md:hidden'
                key={id + 'small'}
                crewmateId={id}
                width={80}
              />
              <CrewmateImage
                className='hidden md:block'
                key={id + 'large'}
                crewmateId={id}
                width={100}
              />
            </>
          ))}
        </div>
      </div>

      <div className='flex flex-col items-center'>
        <p className='text-xl'>Bonuses</p>
        <div className='grid grid-cols-[min-content,1fr] items-center gap-x-2'>
          <CrewBonusStatistics bonuses={bonuses} />
        </div>
      </div>

      <div className='flex flex-col items-center gap-y-1'>
        <Label>Service Fee (SWAY)</Label>
        <p className='text-xs text-muted-foreground'>
          How much should it cost to hire this crew?
        </p>
        <Input
          className='w-64'
          type='number'
          value={fee}
          onChange={(e) => setFee(parseInt(e.target.value))}
        />
      </div>

      <Button
        variant='accent'
        onClick={() => write()}
        disabled={fee === 0}
        icon={<Cog />}
      >
        Register {crew.Name ?? ''}
      </Button>
    </div>
  )
}
