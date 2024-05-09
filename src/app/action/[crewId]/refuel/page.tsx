import { notFound } from 'next/navigation'
import { Wrapper } from './wrapper'
import { Page } from '@/components/page'
import { getFloodgateCrew } from '@/actions'

export default async function RefuelingPage({
  params,
}: {
  params: { crewId: string }
}) {
  const crewId = parseInt(params.crewId, 10)
  const crew = await getFloodgateCrew(crewId)
  const service = crew?.services?.find((s) => s.serviceType === 'RefuelShip')
  const actionFee = service?.actionSwayFee

  if (!crew || !actionFee || service?.enabled === false) {
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
      <Wrapper crew={crew} actionFee={actionFee} />
    </Page>
  )
}
