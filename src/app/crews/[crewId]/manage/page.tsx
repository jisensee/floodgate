import { notFound } from 'next/navigation'
import { MapPin } from 'lucide-react'
import { CrewManagement } from './crew-management'
import { getFloodgateCrew } from '@/actions'
import { Page } from '@/components/page'

export const dynamic = 'force-dynamic'

export default async function CrewManagementPage({
  params,
}: {
  params: { crewId: string }
}) {
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
      <CrewManagement crew={crew} />
    </Page>
  )
}
