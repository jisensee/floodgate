'use server'

import {
  Asteroid,
  Building,
  Crew,
  Crewmate,
  Deposit,
  Entity,
  Lot,
  Product,
} from '@influenceth/sdk'
import esb from 'elastic-builder'
import {
  entitySchema,
  getEntityName,
  InfluenceEntity,
  searchResponseSchema,
} from 'influence-typed-sdk/api'
import { A, D, F, pipe } from '@mobily/ts-belt'
import { influenceApi } from '@/lib/influence-api'
import { getInventories } from '@/inventory-actions'

export type MiningCompanionData = Awaited<
  ReturnType<typeof getMiningCompanionData>
>

export type MiningCompanionExtractor = MiningCompanionData['extractors'][number]
export type CoreDrillInventory =
  MiningCompanionData['coreDrillInventories'][number]
export type MiningCompanionCrew = MiningCompanionData['crews'][number]

export const getMiningCompanionData = async (address: string) => {
  const crews = await influenceApi.util.crews(address)
  const crewIds = crews.map(D.prop('id'))

  const stations = await getCrewStations(crews)
  const [extractorsByLot, assembledCrews, coreDrillInventories] =
    await Promise.all([
      getExtractorsByLot(crewIds),
      assembleCrews(crews, stations),
      getCoreDrillInventories(address),
    ])
  const lotUuids = [...extractorsByLot.keys()]
  const asteroidIds = pipe(
    [...extractorsByLot.values()],
    A.filterMap((e) => e.Location?.resolvedLocations?.asteroid?.id),
    A.uniq
  )
  const [samplesByLot, asteroidNames, abundances] = await Promise.all([
    getSamplesByLot(lotUuids),
    influenceApi.util.asteroidNames(asteroidIds),
    getAbundances(asteroidIds),
  ])
  const settingMaps = pipe(
    [...abundances.entries()],
    A.map(([asteroidId, { abundances, resources }]) => {
      const settings = new Map(
        resources.map(
          (resource) =>
            [
              resource,
              Asteroid.getAbundanceMapSettings(
                asteroidId,
                resource,
                abundances
              ),
            ] as const
        )
      )
      return [asteroidId, settings] as const
    }),
    (e) => new Map(e)
  )

  const getLotAbundance = (
    asteroidId: number,
    lotId: number,
    resource: number
  ) => {
    const settings = settingMaps.get(asteroidId)?.get(resource)
    const lotPosition = Asteroid.getLotPosition(asteroidId, Lot.toIndex(lotId))
    return Asteroid.getAbundanceAtPosition(lotPosition, settings)
  }

  return {
    crews: assembledCrews,
    asteroidNames,
    coreDrillInventories: coreDrillInventories,
    stations,
    extractors: pipe(
      lotUuids,
      A.filterMap((uuid) => {
        const samples = samplesByLot[uuid] ?? []
        const extractor = extractorsByLot.get(uuid)
        const asteroidId =
          extractor?.Location?.resolvedLocations?.asteroid?.id ?? 0
        const extractorAbundances = abundances.get(asteroidId)

        const lotId = extractor?.Location?.resolvedLocations?.lot?.id ?? 0
        return extractor && extractorAbundances
          ? {
              id: extractor.id,
              name: getEntityName(extractor),
              resourceAbundances: pipe(
                extractorAbundances.resources,
                A.map((resource) => ({
                  resource,
                  abundance: getLotAbundance(asteroidId, lotId, resource),
                })),
                A.sortBy((a) => 1 - a.abundance)
              ),
              asteroidId,
              asteroidName: asteroidNames.get(asteroidId) ?? '',
              lotId,
              runningExtraction: extractor.Extractors?.[0],
              samples: A.filterMap(F.toMutable(samples), D.prop('Deposit')),
            }
          : null
      })
    ),
  }
}

const getCoreDrillInventories = async (address: string) => {
  return (await getInventories(address))
    .filter((i) => i.contents?.find((c) => c.product === Product.IDS.CORE_DRILL)?.amount ?? 0 > 0)
    .map(i => {
    return {
      id: i.entity.id,
      slot: i.slot,
      label: i.entity.label,
      name: i.entity.name,
      lotId: i.entity.lotIndex,
      asteroidId: i.entity.asteroidId,
      coreDrills: i.contents?.find((c) => c.product === Product.IDS.CORE_DRILL)?.amount ?? 0
    }
  })
}

const getCrewStations = async (crews: InfluenceEntity[]) => {
  const shipIds = pipe(
    crews,
    A.filterMap((crew) => crew.Location?.resolvedLocations?.ship?.id),
    A.uniq
  )
  const buildingIds = pipe(
    crews,
    A.filterMap((crew) => crew.Location?.resolvedLocations?.building?.id),
    A.uniq
  )
  const [ships, buildings] = await Promise.all([
    influenceApi.entities({
      label: Entity.IDS.SHIP,
      id: shipIds,
    }),
    influenceApi.entities({
      label: Entity.IDS.BUILDING,
      id: buildingIds,
    }),
  ])

  return [...ships, ...buildings]
}

const getAbundances = async (asteroidIds: number[]) => {
  const asteroids = await influenceApi.entities({
    label: Entity.IDS.ASTEROID,
    id: asteroidIds,
  })

  return pipe(
    asteroids,
    A.filterMap((asteroid) => {
      const abundances = asteroid.Celestial?.abundances
      if (!abundances) return undefined
      return [
        asteroid.id,
        {
          abundances,
          resources: pipe(
            Asteroid.getAbundances(abundances),
            D.toPairs,
            A.filter(([, abundance]) => abundance > 0),
            A.map(([resource]) => parseInt(resource))
          ),
        },
      ] as const
    }),
    (e) => new Map(e)
  )
}

const assembleCrews = async (
  crews: InfluenceEntity[],
  stations: InfluenceEntity[]
) => {
  const crewmateIds = pipe(
    crews,
    A.filterMap((c) => c?.Crew?.roster),
    A.flat
  )
  const allCrewmates = await influenceApi.entities({
    label: Entity.IDS.CREWMATE,
    id: crewmateIds,
  })

  return pipe(
    crews,
    A.filterMap((crew) => {
      const crewmates = A.filterMap(crew?.Crew?.roster ?? [], (id) =>
        allCrewmates.find((c) => c.id === id)
      )
      const locations = crew.Location?.resolvedLocations
      const stationUuid = locations?.building?.uuid ?? locations?.ship?.uuid
      const station = stations.find((s) => s.uuid === stationUuid)
      if (station) {
        const sampleQuality = Crew.getAbilityBonus(
          Crewmate.ABILITY_IDS.CORE_SAMPLE_QUALITY,
          crewmates,
          station,
          crew.Crew?.lastFed ?? 0
        ).totalBonus
        const sampleSpeed = Crew.getAbilityBonus(
          Crewmate.ABILITY_IDS.CORE_SAMPLE_TIME,
          crewmates,
          station,
          crew.Crew?.lastFed ?? 0
        ).totalBonus
        return {
          ...crew,
          crewmates,
          station,
          bonuses: {
            sampleQuality,
            sampleSpeed,
          },
        }
      } else {
        return undefined
      }
    }),
    A.filter((crew) =>
      crew.crewmates.some(
        (cm) => cm.Crewmate?.class === Crewmate.CLASS_IDS.MINER
      )
    ),
    A.sortBy((crew) => 1 - crew.bonuses.sampleQuality)
  )
}

const getExtractorsByLot = async (crewIds: number[]) => {
  const extractors = await influenceApi.search({
    index: 'building',
    request: esb
      .requestBodySearch()
      .size(999)
      .query(
        esb
          .boolQuery()
          .must([
            esb.termQuery('Building.buildingType', Building.IDS.EXTRACTOR),
            esb.termQuery(
              'Building.status',
              Building.CONSTRUCTION_STATUSES.OPERATIONAL
            ),
            esb.termsQuery('Control.controller.id', crewIds),
            esb.termsQuery('Control.controller.label', Entity.IDS.CREW),
          ])
      ),
    options: {
      responseSchema: searchResponseSchema(entitySchema),
    },
  })

  return new Map(
    extractors.hits.hits.flatMap(({ _source }) => {
      const lotUuid = _source.Location?.resolvedLocations.lot?.uuid
      return lotUuid ? [[lotUuid, _source] as const] : []
    })
  )
}

const getSamplesByLot = async (lotUuids: string[]) => {
  const samples = await influenceApi.search({
    index: 'deposit',
    request: esb
      .requestBodySearch()
      .size(999)
      .query(
        esb
          .boolQuery()
          .must([
            esb.termsQuery('Location.location.uuid', lotUuids),
            esb.termsQuery('Deposit.status', [
              Deposit.STATUSES.SAMPLED,
              Deposit.STATUSES.SAMPLING,
            ]),
          ])
      ),
    options: {
      responseSchema: searchResponseSchema(entitySchema),
    },
  })
  return A.groupBy(
    samples.hits.hits.map(D.prop('_source')),
    (s) => s.Location?.resolvedLocations.lot?.uuid ?? ''
  )
}
