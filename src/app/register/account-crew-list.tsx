'use client'

import { useQuery } from '@tanstack/react-query'
import { Route } from 'next'
import { A, pipe } from '@mobily/ts-belt'
import Link from 'next/link'
import { CircleAlert, MapPin } from 'lucide-react'
import { getAccountCrews } from './actions'
import { RequireConnectedAccount } from '@/components/require-connected-account'
import { AsyncData } from '@/components/async-data'
import { Skeleton } from '@/components/ui/skeleton'
import { CrewImages } from '@/components/asset-images'
import { CrewBonusStatistics } from '@/components/statistic'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { StandardTooltip } from '@/components/ui/tooltip'

export type AccountCrewListProps = {
  registeredCrewIds: Set<number>
}

export const AccountCrewList = (props: AccountCrewListProps) => {
  return (
    <RequireConnectedAccount>
      {(address) => <List address={address} {...props} />}
    </RequireConnectedAccount>
  )
}

const List = ({
  address,
  registeredCrewIds,
}: AccountCrewListProps & { address: string }) => {
  const result = useQuery({
    queryKey: ['account-crews', address],
    queryFn: () =>
      getAccountCrews(address).then((crews) =>
        crews.filter((c) => c.Crew && c.Crew.roster.length > 0)
      ),
  })

  const loading = (
    <div className='flex flex-col gap-y-3'>
      {A.make(
        5,
        <div className='flex gap-x-2'>
          <Skeleton className='h-[133px] w-[100px] shrink-0' />
          <div className='flex w-full flex-col gap-y-1'>
            <Skeleton className='h-6 w-8/12' />
            <Skeleton className='h-4 w-6/12' />
          </div>
        </div>
      )}
    </div>
  )

  return (
    <AsyncData result={result} onLoading={loading}>
      {(crews) => (
        <div className='flex flex-col gap-y-3'>
          {pipe(
            crews,
            A.filter((crew) => crew.asteroidId > 0),
            A.sortBy((crew) => crew.asteroidId),
            A.map((crew) => (
              <Link
                key={crew.id}
                className='flex gap-x-3 rounded-md p-2 ring-1 hover:ring-2'
                href={`/register/${crew.id}` as Route}
              >
                <CrewImages
                  crewmateIds={crew.Crew?.roster ?? []}
                  width={100}
                  onlyCaptain
                />
                <div className='flex flex-col gap-y-1'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <h2>{crew.Name ?? `Crew#${crew.id}`}</h2>
                    <div className='flex items-center gap-x-1 text-sm'>
                      <MapPin /> {crew.asteroidName ?? crew.asteroidId}
                    </div>
                  </div>
                  <div className='flex flex-wrap gap-2'>
                    <CrewBonusStatistics bonuses={crew.bonuses} />
                  </div>
                  {registeredCrewIds.has(crew.id) && (
                    <StandardTooltip content='Registering it again will reset all configuration.'>
                      <Alert className='mt-1' variant='warning'>
                        <AlertTitle icon={<CircleAlert />}>
                          Crew is already registered
                        </AlertTitle>
                      </Alert>
                    </StandardTooltip>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </AsyncData>
  )
}
