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
      {crews
        ?.filter((c) => !registeredCrewIds.has(c.id))
        .map((crew) => (
          <Link key={crew.id} href={`/register/${crew.id}` as Route}>
            {crew.Name ?? crew.id} ({crew.asteroidName ?? ''})
          </Link>
        ))}
    </div>
  )
}
