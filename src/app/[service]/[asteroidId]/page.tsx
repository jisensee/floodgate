import { notFound, redirect } from 'next/navigation'
import { Route } from 'next'
import { getServiceData } from '@/components/service-button'
import { floodGateServiceTypes } from '@/lib/contract-types'
import { influenceApi } from '@/lib/influence-api'
import { Page } from '@/components/page'
import { getFloodgateCrews } from '@/actions'
import { CrewCard } from '@/components/crew-card'

export const dynamic = 'force-dynamic'

export default async function ServiceCrewsPage({
  params,
}: {
  params: { service: string; asteroidId: string }
}) {
  const serviceType = floodGateServiceTypes.find((s) => s === params.service)
  if (!serviceType) {
    notFound()
  }
  const asteroidId = parseInt(params.asteroidId, 10)
  const asteroidName = await influenceApi.util
    .asteroidNames([asteroidId])
    .then((names) => names.get(asteroidId))
  if (!asteroidName) {
    notFound()
  }

  const crews = await getFloodgateCrews().then((crews) =>
    crews.filter(
      (crew) =>
        crew.asteroidId === asteroidId &&
        crew.services.some((s) => s.serviceType === serviceType && s.enabled)
    )
  )

  if (crews.length === 1) {
    const crewId = crews[0]?.id ?? 1
    redirect(`/${serviceType}/${asteroidId}/${crewId}`)
  }

  const { name } = getServiceData(serviceType)
  return (
    <Page
      title={`${name} on ${asteroidName}`}
      subtitle='Which crew would you like to use?'
      scrollable
    >
      <div className='flex flex-col gap-y-3'>
        {crews.map((crew) => (
          <CrewCard
            key={crew.id}
            crew={crew}
            href={`/${serviceType}/${asteroidId}/${crew.id}` as Route}
            swayFee={
              crew.services.find((s) => s.serviceType === serviceType)
                ?.actionSwayFee
            }
          />
        ))}
      </div>
    </Page>
  )
}
