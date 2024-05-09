'use client'

import { useQuery } from '@tanstack/react-query'
import { Route } from 'next'
import { getAccountCrews } from './actions'
import { RequireConnectedAccount } from '@/components/require-connected-account'
import { Link } from '@/components/ui/link'

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
  const {
    data: crews,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['account-crews', address],
    queryFn: () =>
      getAccountCrews(address).then((crews) =>
        crews.filter((c) => c.Crew && c.Crew.roster.length > 0)
      ),
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div className='flex flex-col gap-y-2'>
      {crews?.map((crew) => (
        <Link
          key={crew.id}
          className='flex items-center gap-3'
          href={`/register/${crew.id}` as Route}
        >
          <span>
            {crew.Name ?? crew.id} ({crew.asteroidName ?? ''})
          </span>
          {registeredCrewIds.has(crew.id) && (
            <span className='text-sm text-warning'>(Already registered)</span>
          )}
        </Link>
      ))}
    </div>
  )
}
