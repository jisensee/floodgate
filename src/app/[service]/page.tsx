import { notFound } from 'next/navigation'
import { Route } from 'next'
import { A, D, G, O, pipe } from '@mobily/ts-belt'
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
  pipe(
    await getFloodgateCrews(),
    A.filter((c) =>
      c.services.some((s) => s.serviceType === service && s.enabled)
    ),
    A.groupBy((c) => c.id),
    D.values,
    A.filter(G.isNotNullable),
    A.map((crews) =>
      pipe(
        crews[0],
        O.fromNullable,
        O.map((crew) => ({
          asteroidId: crew.asteroidId,
          asteroidName: crew.asteroidName,
          crewCount: crews.length,
        }))
      )
    ),
    A.filter(G.isNotNullable)
  )
