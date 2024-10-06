'use client'

import { useQuery } from '@tanstack/react-query'
import { Info } from 'lucide-react'
import { useState } from 'react'
import { A } from '@mobily/ts-belt'
import { getMiningCompanionData } from './actions'
import { FilterRow } from './filters'
import { ExtractorList } from './extractor-list'
import { useMiningCompanionState } from './state'
import { useStartSamplesCall } from './hooks'
import { Summary } from './summary'
import { RequireConnectedAccount } from '@/components/require-connected-account'
import { AsyncData } from '@/components/async-data'
import { Button } from '@/components/ui/button'
import { useTransactionToast } from '@/hooks/transaction-toast'
import { SwayAmount } from '@/components/sway-amount'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'

export type MiningCompanionProps = {
  address: string
}

export const MiningCompanion = () => {
  return (
    <RequireConnectedAccount>
      {(address) => <Wrapper address={address} />}
    </RequireConnectedAccount>
  )
}

const Wrapper = ({ address }: { address: string }) => {
  const result = useQuery({
    queryKey: ['mining-companion', address],
    queryFn: () => getMiningCompanionData(address),
  })
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [state, dispatch] = useMiningCompanionState()
  const {
    sendResult: {
      send: startSamples,
      data,
      status: submitStatus,
      error: submitError,
    },
    fee,
  } = useStartSamplesCall(state.pendingSamples)

  const { isLoading } = useTransactionToast({
    txHash: data?.transaction_hash,
    submitStatus,
    submitError,
    pendingMessage: 'Starting samples...',
    successMessage: 'Samples started!',
    onSuccess: () => {
      dispatch({ type: 'reset-queued-samples' })
      setTimeout(() => result.refetch(), 1_000)
    },
  })

  const summary = (
    <Dialog open={summaryOpen} onOpenChange={setSummaryOpen}>
      <DialogTrigger asChild disabled={state.pendingSamples.length === 0}>
        <Button variant='outline' icon={<Info />}>
          Summary
        </Button>
      </DialogTrigger>
      <Summary state={state} fee={fee} onClose={() => setSummaryOpen(false)} />
    </Dialog>
  )

  const loadingUi = (
    <div className='flex w-full flex-col gap-y-2 md:w-[35rem]'>
      <Skeleton className='h-4 w-14' />
      <Skeleton className='h-12 w-full' />
      <Skeleton className='h-12 w-full' />
      {A.makeWithIndex(5, (i) => (
        <Skeleton key={i} className='h-20 w-full' />
      ))}
    </div>
  )

  return (
    <AsyncData result={result} onLoading={loadingUi}>
      {({ extractors, asteroidNames, crews, coreDrillInventories }) => (
        <div className='flex flex-col gap-y-2'>
          <FilterRow
            filters={state.filters}
            onFiltersChange={(filters) =>
              dispatch({ type: 'update-filters', filters })
            }
            asteroidNames={asteroidNames}
          />
          <div className='flex items-center gap-x-3'>
            <Button
              className='w-full'
              onClick={() => startSamples()}
              loading={isLoading}
              disabled={state.pendingSamples.length === 0}
            >
              Start {state.pendingSamples.length} samples for{' '}
              <SwayAmount className='ml-1' amount={fee} convert />
            </Button>
            {summary}
          </div>
          <ExtractorList
            extractors={extractors}
            filters={state.filters}
            coreDrillInventories={coreDrillInventories}
            crews={crews}
            state={state}
            dispatch={dispatch}
          />
        </div>
      )}
    </AsyncData>
  )
}
