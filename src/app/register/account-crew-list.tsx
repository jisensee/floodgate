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
  const { data: crews } = useQuery({
    queryKey: ['account-crews', address],
    queryFn: () => getAccountCrews(address),
  })

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
            <span className='text-sm text-yellow-500'>
              (Already registered)
            </span>
          )}
        </Link>
      ))}
    </div>
  )
}
