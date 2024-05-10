import { notFound } from 'next/navigation'
import { MapPin } from 'lucide-react'
import Link from 'next/link'
import { getServiceData } from '@/components/service-button'
import { floodGateServiceTypes } from '@/lib/contract-types'
import { influenceApi } from '@/lib/influence-api'
import { Page } from '@/components/page'
import { getFloodgateCrews } from '@/actions'
import { CrewmateImage } from '@/components/asset-images'
import { SwayAmount } from '@/components/sway-amount'
import { CrewBonusStatistics } from '@/components/statistic'

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

  // if (crews.length === 1) {
  //   const crewId = crews[0]?.id ?? 1
  //   redirect(`/${serviceType}/${asteroidId}/${crewId}`)
  // }

  const { name } = getServiceData(serviceType)
  return (
    <Page
      title={`${name} on ${asteroidName}`}
      subtitle='Which crew would you like to use?'
      scrollable
    >
      {crews.map((crew) => (
        <Link
          key={crew.id}
          className='flex gap-x-3 rounded-md p-3 ring-1 hover:ring-2'
          href={`/${serviceType}/${asteroidId}/${crew.id}`}
        >
          <CrewmateImage crewmateId={crew.crewmateIds[0] ?? 0} width={120} />
          <div className='flex flex-col gap-y-2'>
            <div className='flex flex-wrap gap-2'>
              <h2>{crew.name}</h2>
              <div className='flex items-center gap-x-2'>
                <MapPin /> <span>{crew.asteroidName}</span>
              </div>
            </div>
            <SwayAmount
              amount={
                crew.services.find((s) => s.serviceType === serviceType)
                  ?.actionSwayFee ?? 0
              }
              convert
            />
            <div className='flex flex-wrap gap-2'>
              <CrewBonusStatistics bonuses={crew.bonuses} />
            </div>
          </div>
        </Link>
      ))}
    </Page>
  )
}
