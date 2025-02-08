import { notFound } from 'next/navigation'
import { MapPin } from 'lucide-react'
import { CrewDetails } from './crew-details'
import { getFloodgateCrew } from '@/actions'
import { Page } from '@/components/page'

export const dynamic = 'force-dynamic'

export default async function CrewDetailPage(
  props: {
    params: Promise<{ crewId: string }>
  }
) {
  const params = await props.params;
  const crew = await getFloodgateCrew(parseInt(params.crewId, 10))

  if (!crew) {
    notFound()
  }

  return (
    <Page
      scrollable
      title={
        <div className='flex flex-col items-center'>
          <h1>{crew.name}</h1>
          <div className='flex items-center gap-x-1 text-sm'>
            <MapPin />
            {crew.stationName}, {crew.asteroidName}
          </div>
        </div>
      }
    >
      <CrewDetails crew={crew} showServices showManageButton />
    </Page>
  )
}
