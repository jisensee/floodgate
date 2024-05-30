import { notFound } from 'next/navigation'
import { MapPin } from 'lucide-react'
import { entitySchema, searchResponseSchema } from 'influence-typed-sdk/api'
import esb from 'elastic-builder'
import { Building, Entity, Permission } from '@influenceth/sdk'
import { CrewManagement } from './crew-management'
import { getFloodgateCrew } from '@/actions'
import { Page } from '@/components/page'
import { influenceApi } from '@/lib/influence-api'

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

  const availableWarehouses = await getAvailableWarehouses(
    crew.id,
    crew.asteroidId
  )

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
      <CrewManagement crew={crew} availableWarehouses={availableWarehouses} />
    </Page>
  )
}

const getAvailableWarehouses = (crewId: number, crewAsteroidId: number) =>
  influenceApi
    .search({
      index: 'building',
      request: esb
        .requestBodySearch()
        .query(
          esb
            .boolQuery()
            .must([
              esb.termQuery('Building.buildingType', Building.IDS.WAREHOUSE),
              esb.nestedQuery(
                esb
                  .boolQuery()
                  .must([
                    esb.termQuery(
                      'Location.locations.label',
                      Entity.IDS.ASTEROID
                    ),
                    esb.termQuery('Location.locations.id', crewAsteroidId),
                  ]),
                'Location.locations'
              ),
              esb
                .boolQuery()
                .should([
                  esb.termQuery('Control.controller.id', crewId),
                  esb.nestedQuery(
                    esb
                      .boolQuery()
                      .must([
                        esb.termQuery(
                          'WhitelistAgreements.permission',
                          Permission.IDS.REMOVE_PRODUCTS
                        ),
                        esb.termQuery(
                          'WhitelistAgreements.permitted.id',
                          crewId
                        ),
                        esb.termQuery('WhitelistAgreements.whitelisted', true),
                      ]),
                    'WhitelistAgreements'
                  ),
                ]),
            ])
        )
        .toJSON(),
      options: {
        responseSchema: searchResponseSchema(entitySchema),
      },
    })
    .then((r) => r.hits.hits.map((h) => h._source))
