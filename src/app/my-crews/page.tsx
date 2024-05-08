'use client'

import { Route } from 'next'
import { Page } from '@/components/page'
import { RequireConnectedAccount } from '@/components/require-connected-account'
import { Link } from '@/components/ui/link'
import { useAccountCrews } from '@/hooks/queries'

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
      <div>
        {crews
          .filter((c) => c.managerAddress === BigInt(address))
          .map((crew) => (
            <Link key={crew.id} href={`/crews/${crew.id}` as Route}>
              {crew.name}
            </Link>
          ))}
      </div>
    )
  )
}
