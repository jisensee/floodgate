'use client'

import { InfluenceEntity } from 'influence-typed-sdk/api'
import { Cog, MapPin } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RequireConnectedAccount } from '@/components/require-connected-account'
import { getCrewBonuses } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useRegisterCrew } from '@/hooks/contract'
import { CrewImages } from '@/components/asset-images'
import { CrewBonusStatistics } from '@/components/statistic'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTransactionToast } from '@/hooks/transaction-toast'

export type RegisterCrewFormProps = {
  crew: InfluenceEntity
  crewmates: InfluenceEntity[]
  station: InfluenceEntity
  asteroidName: string
}

export const RegisterCrewForm = (props: RegisterCrewFormProps) => (
  <RequireConnectedAccount>
    {(address) => <Form {...props} address={address} />}
  </RequireConnectedAccount>
)

const Form = ({
  crew,
  crewmates,
  station,
  asteroidName,
  address,
}: RegisterCrewFormProps & { address: string }) => {
  const router = useRouter()
  const bonuses = getCrewBonuses(crew, crewmates, station)
  const [managerAddress, setManagerAddress] = useState(address)
  const {
    write: register,
    data,
    status,
    error,
  } = useRegisterCrew(crew.id, managerAddress)
  const { isLoading } = useTransactionToast({
    txHash: data?.transaction_hash,
    submitStatus: status,
    submitError: error,
    pendingMessage: 'Registering crew...',
    successMessage: 'Crew registered!',
    onSuccess: () => router.push(`/crews/${crew.id}/manage`),
  })
  return (
    <div className='flex flex-col items-center gap-y-8'>
      <div className='flex w-full flex-col gap-y-1'>
        <div className='flex w-full flex-col items-center justify-between md:flex-row'>
          <h2>{crew.Name ?? crew.id}</h2>
          <div className='flex gap-x-2'>
            <MapPin />
            {station.Name ? station.Name + ', ' : ''}
            {asteroidName}
          </div>
        </div>
        <CrewImages crewmateIds={crewmates.map(({ id }) => id)} width={100} />
      </div>

      <div className='flex flex-wrap gap-2'>
        <CrewBonusStatistics bonuses={bonuses} />
      </div>

      <div className='flex w-11/12 flex-col gap-y-2'>
        <Label>Manager address</Label>
        <Input
          value={managerAddress}
          onChange={(e) => setManagerAddress(e.target.value)}
        />
      </div>

      <Button
        variant='accent'
        onClick={() => register()}
        icon={<Cog />}
        loading={isLoading}
      >
        Register {crew.Name ?? ''}
      </Button>
    </div>
  )
}
