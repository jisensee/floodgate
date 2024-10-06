import { A, pipe } from '@mobily/ts-belt'
import { Dispatch } from 'react'
import { match } from 'ts-pattern'
import {
  CoreDrillInventory,
  MiningCompanionCrew,
  MiningCompanionExtractor,
} from './actions'
import { Extractor } from './extractor'
import { Action, Filters, SortOptions, State } from './state'
import { Sorting } from '@/components/sort-dropdown'

export type ExtractorListProps = {
  extractors: MiningCompanionExtractor[]
  crews: MiningCompanionCrew[]
  coreDrillInventories: CoreDrillInventory[]
  filters: Filters
  state: State
  dispatch: Dispatch<Action>
}

const extractorSort = (
  extractor1: MiningCompanionExtractor,
  extractor2: MiningCompanionExtractor,
  sorting: Sorting<SortOptions>
) =>
  match(sorting.sortBy)
    .with('asteroid', () => extractor1.asteroidId - extractor2.asteroidId)
    .with('alphabetical', () => extractor1.name.localeCompare(extractor2.name))
    .with(
      'extraction-time',
      () =>
        (extractor1.runningExtraction?.finishTime ?? 0) -
        (extractor2.runningExtraction?.finishTime ?? 0)
    )
    .with(
      'available-samples',
      () => extractor1.samples.length - extractor2.samples.length
    )
    .exhaustive() * (sorting.sortDirection === 'asc' ? 1 : -1)

export const ExtractorList = ({
  extractors,
  crews,
  coreDrillInventories: coreDrillInventories,
  filters,
  state,
  dispatch,
}: ExtractorListProps) => {
  const extractorMatchesFilters = (extractor: MiningCompanionExtractor) =>
    (!filters.asteroidId || extractor.asteroidId === filters.asteroidId) &&
    (!filters.search ||
      extractor.name.toLowerCase().includes(filters.search.toLowerCase()))

  return (
    <div className='flex w-full flex-col gap-y-2 md:w-[40rem]'>
      {pipe(
        extractors,
        A.filter(extractorMatchesFilters),
        A.sort((e1, e2) => extractorSort(e1, e2, filters.sorting)),
        A.map((extractor) => (
          <Extractor
            key={extractor.id}
            extractor={extractor}
            crews={crews.filter(
              (c) =>
                c.Location?.resolvedLocations?.asteroid?.id ===
                extractor.asteroidId
            )}
            coreDrillInventories={coreDrillInventories.filter(
              (c) => c.asteroidId === extractor.asteroidId
            )}
            state={state}
            dispatch={dispatch}
          />
        ))
      )}
    </div>
  )
}
