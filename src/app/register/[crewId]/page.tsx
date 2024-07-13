import { Entity } from '@influenceth/sdk'
import { notFound } from 'next/navigation'
import { RegisterCrewForm } from './register-crew-form'
import { Page } from '@/components/page'
import { influenceApi } from '@/lib/influence-api'

export const dynamic = 'force-dynamic'

export default async function RegisterCrewPage({
  params,
}: {
  params: { crewId: string }
}) {
  const crew = await influenceApi.entity({
    id: parseInt(params.crewId, 10),
    label: Entity.IDS.CREW,
  })
  if (!crew || crew.Crew?.roster.length === 0) {
    notFound()
  }

  const asteroidId = crew.Location?.resolvedLocations?.asteroid?.id ?? 0
  const [asteroidNames, crewmates, station] = await Promise.all([
    influenceApi.util.asteroidNames([asteroidId]),
    influenceApi.entities({
      id: crew.Crew?.roster ?? [],
      label: Entity.IDS.CREWMATE,
    }),
    influenceApi.entity({
      id: crew.Location?.resolvedLocations?.building?.id ?? 0,
      label: Entity.IDS.BUILDING,
    }),
  ])

  const asteroidName = asteroidNames.get(asteroidId) ?? asteroidId.toString()

  if (!station) {
    notFound()
  }

  return (
    <Page title='Register Crew' scrollable>
      <RegisterCrewForm
        crew={crew}
        crewmates={crewmates}
        station={station}
        asteroidName={asteroidName}
      />
    </Page>
  )
}
