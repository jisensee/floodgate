import { ContractCrewDisplay } from './contract-crew-display'
import { Page } from '@/components/page'
import { getContractCrews } from '@/lib/contract'

export default async function Home() {
  const crews = await getContractCrews()

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
