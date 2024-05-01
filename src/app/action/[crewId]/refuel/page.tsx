import { notFound } from 'next/navigation'
import { Wrapper } from './wrapper'
import { Page } from '@/components/page'
import { getContractCrews } from '@/lib/contract'

export default async function RefuelingPage({
  params,
}: {
  params: { crewId: string }
}) {
  const contractCrews = await getContractCrews()
  const crewId = parseInt(params.crewId, 10)
  const crew = contractCrews.find((c) => c.id === crewId)
  if (!crew) {
    notFound()
  }

  return (
    <Page
      title={
        <div className='flex flex-col items-center gap-y-2'>
          <h1>Refuel ship</h1>
          <p className='text-muted-foreground'>
            Using <span className='text-foreground'>{crew.name}</span> on{' '}
            <span className='text-foreground'>{crew.asteroidName}</span>
          </p>
        </div>
      }
    >
      <Wrapper crew={crew} />
    </Page>
  )
}
