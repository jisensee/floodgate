'use client'

import { Route } from 'next'
import { Page } from '@/components/page'
import { RequireConnectedAccount } from '@/components/require-connected-account'
import { useAccountCrews } from '@/hooks/queries'
import { CrewCard } from '@/components/crew-card'

export default function MyCrewsPage() {
  return (
    <Page title='My Crews'>
      <RequireConnectedAccount>
        {(address) => <MyCrews address={address} />}
      </RequireConnectedAccount>
    </Page>
  )
}

const MyCrews = ({ address }: { address: string }) => {
  const { data: crews } = useAccountCrews(address)

  return (
    crews && (
      <div className='flex flex-col gap-y-3'>
        {crews
          .filter((c) => c.managerAddress === BigInt(address))
          .map((crew) => (
            <CrewCard
              key={crew.id}
              crew={crew}
              href={`/crews/${crew.id}` as Route}
            />
          ))}
      </div>
    )
  )
}
