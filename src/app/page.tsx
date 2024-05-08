import { ContractCrewDisplay } from './contract-crew-display'
import { getFloodgateCrews } from '@/actions'
import { Page } from '@/components/page'

export default async function Home() {
  const crews = await getFloodgateCrews()

  return (
    <Page title='Floodgate' hideBorder fullSize>
      <div className='flex flex-col items-center gap-y-5'>
        <p className='text-center text-2xl'>
          Hire specialized crews from all over the belt!
        </p>
        <div className='flex flex-col items-center gap-y-3'>
          {crews.map((crew) => (
            <ContractCrewDisplay key={crew.id} crew={crew} />
          ))}
        </div>
      </div>
    </Page>
  )
}
