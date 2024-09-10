import { Reducer, useReducer } from 'react'
import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { match } from 'ts-pattern'
import { Sorting } from '@/components/sort-dropdown'

export type SortOptions =
  | 'alphabetical'
  | 'asteroid'
  | 'extraction-time'
  | 'available-samples'

export type Filters = {
  asteroidId?: number
  search?: string
  sorting: Sorting<SortOptions>
}

export type PendingSample = {
  uuid: string
  lotId: number
  resource: number
  extractorName: string
  asteroidName: string
  origin: {
    id: number
    label: number
    slot: number
  }
  crewId: number
}

export type State = {
  filters: Filters
  pendingSamples: PendingSample[]
}

export type UpdateFilters = {
  type: 'update-filters'
  filters: Filters
}

export type QueueSamples = {
  type: 'queue-samples'
  samples: Omit<PendingSample, 'uuid'>[]
}

export type RemoveQueuedSample = {
  type: 'remove-sample'
  uuid: string
}

export type ResetQueuedSamples = {
  type: 'reset-queued-samples'
}

export type Action =
  | UpdateFilters
  | QueueSamples
  | RemoveQueuedSample
  | ResetQueuedSamples

const reducer: Reducer<State, Action> = (currentState, action) =>
  match(action)
    .returnType<State>()
    .with({ type: 'update-filters' }, (action) => ({
      ...currentState,
      filters: action.filters,
    }))
    .with({ type: 'queue-samples' }, (action) => ({
      ...currentState,
      pendingSamples: [
        ...currentState.pendingSamples,
        ...action.samples.map((s) => ({
          uuid: window.crypto.randomUUID(),
          ...s,
        })),
      ],
    }))
    .with({ type: 'remove-sample' }, (action) => ({
      ...currentState,
      pendingSamples: currentState.pendingSamples.filter(
        (s) => s.uuid !== action.uuid
      ),
    }))
    .with({ type: 'reset-queued-samples' }, () => ({
      ...currentState,
      pendingSamples: [],
    }))
    .exhaustive()

export const useMiningCompanionState = () =>
  useReducer(reducer, {
    pendingSamples: [],
    filters: {
      sorting: {
        sortBy: 'available-samples',
        sortDirection: 'asc',
      },
    },
  })

const lastSamplesAtom = atomWithStorage<
  Record<number, Omit<PendingSample, 'uuid'>>
>('last-samples', {})

export const useLastSamples = () => useAtom(lastSamplesAtom)
