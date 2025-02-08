import { notFound } from 'next/navigation'
import { formatDistance } from 'date-fns'
import { Refeed } from './automatic-refeed'
import { getFloodgateCrew } from '@/actions'
import { Page } from '@/components/page'
import { CrewImages } from '@/components/asset-images'
import { FoodStatus } from '@/components/food-status'

export default async function CrewFeedPage(
  props: {
    params: Promise<{ crewId: string }>
  }
) {
  const params = await props.params;
  const crew = await getFloodgateCrew(parseInt(params.crewId))
  if (!crew) notFound()

  return (
    <Page title={`Feed ${crew.name}`}>
      <div className='flex flex-col items-center gap-y-5'>
        <CrewImages width={100} crewmateIds={crew.crewmateIds} />
        <FoodStatus foodRatio={crew.currentFoodRatio} className='text-2xl' />
        {crew.busyUntil ? (
          <div className='flex flex-col items-center gap-y-3'>
            <p className='text-xl'>
              This crew is currently busy and can&apos;t be fed.
            </p>
            <p className='text-muted-foreground'>
              It will be ready in{' '}
              <span className='text-foreground'>
                {formatDistance(crew.busyUntil, new Date())}
              </span>{' '}
              ({crew.busyUntil.toLocaleString()})
            </p>
          </div>
        ) : (
          <Refeed crew={crew} />
        )}
      </div>
    </Page>
  )
}
