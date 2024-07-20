'use server'

import { isBefore, isAfter } from 'date-fns'
import { Building, Entity, Lot, Permission } from '@influenceth/sdk'
import esb from 'elastic-builder'
import {
  InfluenceEntity,
  entitySchema,
  getEntityName,
  searchResponseSchema,
} from 'influence-typed-sdk/api'
import { A, D, O, flow, pipe } from '@mobily/ts-belt'
import { influenceApi } from '@/lib/influence-api'

export type LotLease = Awaited<ReturnType<typeof getLots>>[number] & {
  addedDays?: number
}

export const getLots = async (address: string, asteroidId?: number) => {
  const crewids = await influenceApi.util
    .crews(address)
    .then((crews) => crews.map((c) => c.id))
  return influenceApi
    .search({
      index: 'lot',
      request: esb
        .requestBodySearch()
        .size(9999)
        .query(
          esb
            .boolQuery()
            .must([
              ...(asteroidId
                ? [esb.termsQuery('Location.location.id', asteroidId)]
                : []),
              esb.nestedQuery(
                esb
                  .boolQuery()
                  .must([
                    esb.termsQuery(
                      'PrepaidAgreements.permission',
                      Permission.IDS.USE_LOT
                    ),
                    esb.termsQuery('PrepaidAgreements.permitted.id', crewids),
                    esb.termsQuery(
                      'PrepaidAgreements.permitted.label',
                      Entity.IDS.CREW
                    ),
                  ]),
                'PrepaidAgreements'
              ),
            ])
        ),
      options: {
        responseSchema: searchResponseSchema(entitySchema),
      },
    })
    .then(
      flow(
        D.prop('hits'),
        D.prop('hits'),
        A.map(D.prop('_source')),
        A.keepMap(convertLot)
      )
    )
    .then(async (lots) => {
      const asteroidIds = pipe(lots.map(D.prop('asteroidId')), A.uniq)
      const [asteroidNames, buildings, asteroidInfos] = await Promise.all([
        influenceApi.util.asteroidNames(asteroidIds),
        getBuildings(lots.map(D.prop('lotId'))),
        getAsteroidInfos(asteroidIds),
      ])

      return pipe(
        lots,
        A.keepMap((lot) =>
          pipe(
            O.zip(
              asteroidNames.get(lot.asteroidId),
              asteroidInfos.get(lot.asteroidId)
            ),
            O.map(([asteroidName, asteroidInfo]) => ({
              ...lot,
              asteroidName,
              buildingName: buildings.get(lot.lotId),
              asteroidAdmin: asteroidInfo.admin,
              asteroidPolicy: asteroidInfo.policy,
            }))
          )
        )
      )
    })
}

const getAsteroidInfos = async (asteroidIds: number[]) => {
  const asteroidInfos = await influenceApi
    .entities({
      label: Entity.IDS.ASTEROID,
      id: asteroidIds,
    })
    .then(
      A.keepMap((a) =>
        pipe(
          O.zip(a.Control?.controller?.id, A.head(a.PrepaidPolicies)),
          O.map(([crewId, policy]) => ({
            asteroidId: a.id,
            crewId,
            policy,
          }))
        )
      )
    )
  const crewToDelegate = await influenceApi
    .entities({
      label: Entity.IDS.CREW,
      id: pipe(
        asteroidInfos,
        (a) => [...a.values()],
        A.map(D.prop('crewId')),
        A.uniq
      ),
    })
    .then(
      flow(
        A.keepMap((c) =>
          c.Crew ? ([c.id, c.Crew.delegatedTo] as const) : undefined
        ),
        (e) => new Map(e)
      )
    )

  return pipe(
    asteroidInfos,
    A.keepMap((info) =>
      pipe(
        crewToDelegate.get(info.crewId),
        O.map(
          (delegate) =>
            [
              info.asteroidId,
              {
                ...info,
                admin: delegate,
              },
            ] as const
        )
      )
    ),
    (a) => new Map(a)
  )
}

const getBuildings = (lotIds: number[]) =>
  influenceApi
    .search({
      index: 'building',
      request: esb
        .requestBodySearch()
        .size(9999)
        .query(
          esb.termsQuery(
            'Location.location.uuid',
            lotIds.map((id) => Entity.packEntity({ id, label: Entity.IDS.LOT }))
          )
        ),
      options: {
        responseSchema: searchResponseSchema(entitySchema),
      },
    })
    .then(
      flow(
        D.prop('hits'),
        D.prop('hits'),
        A.map(D.prop('_source')),
        A.filter(
          (b) =>
            b.Building?.status === Building.CONSTRUCTION_STATUSES.OPERATIONAL
        ),
        A.map(
          (building) =>
            [
              building.Location?.resolvedLocations?.lot?.id ?? 0,
              getEntityName(building),
            ] as const
        ),
        (a) => new Map(a)
      )
    )

const convertLot = (lot: InfluenceEntity) => {
  const agreement = lot.PrepaidAgreements?.find((a) => {
    const now = new Date()
    return isBefore(a.startTimestamp, now) && isAfter(a.endTimestamp, now)
  })
  if (!agreement) return

  const { lotIndex, asteroidId } = Lot.toPosition(lot.id)
  return {
    agreement: {
      ...agreement,
      rate: agreement.rate * 24, // convert from adalian days to irl days
    },
    lotId: lot.id,
    lotIndex,
    asteroidId,
  }
}
