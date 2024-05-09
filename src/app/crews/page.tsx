import { ContractCrewDisplay } from './contract-crew-display'
import { getFloodgateCrews } from '@/actions'
import { Page } from '@/components/page'

export default async function CrewListPage() {
  const crews = await getFloodgateCrews()

  return (
    <Page title='Floodate Crews' scrollable>
      <div className='flex flex-col items-center gap-y-3'>
        {crews.map((crew) => (
          <ContractCrewDisplay key={crew.id} crew={crew} />
        ))}
      </div>
    </Page>
  )
}
