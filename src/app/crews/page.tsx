import { getFloodgateCrews } from '@/actions'
import { CrewCard } from '@/components/crew-card'
import { Page } from '@/components/page'

export const dynamic = 'force-dynamic'

export default async function CrewListPage() {
  const crews = await getFloodgateCrews()

  return (
    <Page title='Floodate Crews' scrollable>
      <div className='flex flex-col items-center gap-y-3'>
        {crews.map((crew) => (
          <CrewCard key={crew.id} crew={crew} />
        ))}
      </div>
    </Page>
  )
}
