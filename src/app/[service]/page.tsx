import * as R from 'remeda'
import { notFound } from 'next/navigation'
import { Route } from 'next'
import { getFloodgateCrews } from '@/actions'
import { floodGateServiceTypes } from '@/lib/contract-types'
import { Page } from '@/components/page'
import { getServiceData } from '@/components/service-button'
import { Link } from '@/components/ui/link'

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
      {availableAsteroids.map(({ asteroidId, asteroidName, crewCount }) => (
        <Link key={asteroidId} href={`/${service}/${asteroidId}` as Route}>
          {asteroidName} ({crewCount})
        </Link>
      ))}
    </Page>
  )
}

const getAvailableAsteroids = async (service: string) =>
  R.pipe(
    await getFloodgateCrews(),
    R.filter((c) =>
      c.services.some((s) => s.serviceType === service && s.enabled)
    ),
    R.groupBy((c) => c.id),
    R.mapValues((crews) =>
      crews[0]
        ? {
            asteroidId: crews[0].asteroidId,
            asteroidName: crews[0].asteroidName,
            crewCount: crews.length,
          }
        : undefined
    ),
    R.values,
    R.filter(R.isTruthy)
  )
