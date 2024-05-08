import { AccountCrewList } from './account-crew-list'
import { getRegisteredCrews } from '@/actions'
import { Page } from '@/components/page'

export default async function RegisterCrewPage() {
  const registeredCrews = await getRegisteredCrews()

  return (
    <Page
      title='Register Crew'
      subtitle='Register one of your crews and earn SWAY when others use them.'
    >
      <AccountCrewList
        registeredCrewIds={
          new Set(registeredCrews.map((c) => Number(c.crew_id)))
        }
      />
    </Page>
  )
}
