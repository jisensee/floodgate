import { notFound } from 'next/navigation'
import { Route } from 'next'
import { A, D, G, O, pipe } from '@mobily/ts-belt'
import Link from 'next/link'
import { getFloodgateCrews } from '@/actions'
import {
  FloodgateServiceType,
  floodGateServiceTypes,
} from '@/lib/contract-types'
import { Page } from '@/components/page'
import { getServiceData } from '@/components/service-button'
import { AsteroidImage } from '@/components/asset-images'
import { SwayAmount } from '@/components/sway-amount'
import { pluralize } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function ServicePage({
  params,
}: {
  params: { service: string }
}) {
  const service = floodGateServiceTypes.find((s) => s === params.service)
  if (!service) {
    notFound()
  }
  const availableAsteroids = await getAvailableAsteroids(service)

  // if (availableAsteroids.length === 1) {
  //   const asteroidId = availableAsteroids[0]?.asteroidId ?? 1
  //   redirect(`/${service}/${asteroidId}` as Route)
  // }

  const { name } = getServiceData(service)
  return (
    <Page
      title={name}
      subtitle='On which asteroid do you want to use this service?'
      scrollable
    >
      {availableAsteroids.map(
        ({ asteroidId, asteroidName, crewCount, swayFee }) => (
          <Link
            key={asteroidId}
            className='flex gap-x-3 rounded-md p-2 ring-1 hover:ring-2'
            href={`/${service}/${asteroidId}` as Route}
          >
            <AsteroidImage id={asteroidId} width={100} />
            <div className='flex flex-col gap-y-1'>
              <h2>{asteroidName}</h2>
              <p className='text-muted-foreground'>
                {crewCount} available {pluralize(crewCount, 'crew')}
              </p>
              <div className='flex items-center gap-x-1'>
                <span>Starting at</span>
                <SwayAmount amount={swayFee} convert />
              </div>
            </div>
          </Link>
        )
      )}
    </Page>
  )
}

const getAvailableAsteroids = async (service: FloodgateServiceType) =>
  pipe(
    await getFloodgateCrews(),
    A.filter((c) =>
      c.services.some((s) => s.serviceType === service && s.enabled)
    ),
    A.groupBy((c) => c.asteroidId),
    D.values,
    A.filter(G.isNotNullable),
    A.map((crews) =>
      pipe(
        crews,
        A.sortBy(
          (c) =>
            c.services.find((s) => s.serviceType === service)?.actionSwayFee
        ),
        A.head,
        O.fromNullable,
        O.map((crew) => ({
          asteroidId: crew.asteroidId,
          asteroidName: crew.asteroidName,
          crewCount: crews.length,
          swayFee:
            crew.services.find((s) => s.serviceType === service)
              ?.actionSwayFee ?? 0,
        }))
      )
    ),
    A.filter(G.isNotNullable),
    A.uniqBy((a) => a.asteroidId)
  )
