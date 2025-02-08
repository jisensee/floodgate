import { notFound } from 'next/navigation'
import { RefuelPage } from './refuel/refuel-page'
import { TransferGoodsPage } from './transfer-goods/transfer-goods-page'
import { getFloodgateCrew } from '@/actions'
import { Page } from '@/components/page'
import { getServiceData } from '@/components/service-button'
import { floodGateServiceTypes } from '@/lib/contract-types'
import { influenceApi } from '@/lib/influence-api'

export const dynamic = 'force-dynamic'

export default async function CrewsActionPage(
  props: {
    params: Promise<{ service: string; asteroidId: string; crewId: string }>
  }
) {
  const params = await props.params;
  const service = floodGateServiceTypes.find((s) => s === params.service)
  if (!service) {
    notFound()
  }
  const asteroidId = parseInt(params.asteroidId, 10)
  const crewId = parseInt(params.crewId, 10)
  const crew = await getFloodgateCrew(crewId)
  if (!crew || crew.asteroidId !== asteroidId) {
    notFound()
  }
  const asteroidName = await influenceApi.util
    .asteroidNames([asteroidId])
    .then((names) => names.get(asteroidId))
  if (!asteroidName) {
    notFound()
  }

  const crewSupportsService = crew.services.some(
    (s) => s.serviceType === service && s.enabled
  )
  const { name } = getServiceData(service)

  return (
    <Page title={`${name} on ${asteroidName}`} subtitle={`Using ${crew.name}`}>
      {service === 'RefuelShip' && crewSupportsService && (
        <RefuelPage crew={crew} />
      )}
      {service === 'TransferGoods' && crewSupportsService && (
        <TransferGoodsPage crew={crew} />
      )}
      {!crewSupportsService && (
        <p>This service is not supported by this crew currently.</p>
      )}
    </Page>
  )
}
