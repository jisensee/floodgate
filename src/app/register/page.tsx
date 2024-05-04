import { AccountCrewList } from './account-crew-list'
import { Page } from '@/components/page'
import { getRegisteredCrews } from '@/lib/contract'

export default async function RegisterCrewPage() {
  const registeredCrews = await getRegisteredCrews()

  return (
    <Page
      title='Register Crew'
      subtitle='Register one of your crews and earn some SWAY when others use them.'
    >
      <AccountCrewList
        registeredCrewIds={new Set(registeredCrews.map((c) => c.id))}
      />
    </Page>
  )
}
