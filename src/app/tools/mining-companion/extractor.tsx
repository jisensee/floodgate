import { Deposit } from '@influenceth/sdk'
import { Dispatch, useState } from 'react'
import {
  Check,
  Hourglass,
  MapPin,
  Plus,
  Rows4,
  ShoppingCart,
} from 'lucide-react'
import {
  CoreDrillInventory,
  MiningCompanionCrew,
  MiningCompanionExtractor,
} from './actions'
import { Action, State } from './state'
import { ExtractorDetails } from './extractor-details'
import { AddSample } from './add-sample'
import { ExtractorStatus } from './extractor-status'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { StandardTooltip } from '@/components/ui/tooltip'
import { cn, pluralize } from '@/lib/utils'

export type ExtractorProps = {
  extractor: MiningCompanionExtractor
  crews: MiningCompanionCrew[]
  coreDrillInventories: CoreDrillInventory[]
  state: State
  dispatch: Dispatch<Action>
}
export const Extractor = ({
  extractor,
  crews,
  coreDrillInventories,
  state,
  dispatch,
}: ExtractorProps) => {
  const [extractorDetailsOpen, setExtractorDetailsOpen] = useState(false)
  const [addSampleOpen, setAddSampleOpen] = useState(false)

  const readySamples = extractor.samples.filter(
    (s) => s.status === Deposit.STATUSES.SAMPLED
  ).length

  const queueSample = (
    <Dialog open={addSampleOpen} onOpenChange={setAddSampleOpen}>
      <StandardTooltip withDelay content='Queue a sample'>
        <DialogTrigger asChild>
          <Button size='xs' variant='ghost'>
            <Plus />
          </Button>
        </DialogTrigger>
      </StandardTooltip>
      <AddSample
        dispatch={dispatch}
        extractor={extractor}
        crews={crews}
        coreDrillInventories={coreDrillInventories}
        onClose={() => setAddSampleOpen(false)}
      />
    </Dialog>
  )
  const details = (
    <Dialog open={extractorDetailsOpen} onOpenChange={setExtractorDetailsOpen}>
      <StandardTooltip withDelay content='View details'>
        <DialogTrigger asChild>
          <Button size='xs' variant='ghost'>
            <Rows4 />
          </Button>
        </DialogTrigger>
      </StandardTooltip>
      <ExtractorDetails
        extractor={extractor}
        state={state}
        dispatch={dispatch}
        onClose={() => setExtractorDetailsOpen(false)}
        onQueueSample={() => {
          setExtractorDetailsOpen(false)
          setAddSampleOpen(true)
        }}
      />
    </Dialog>
  )
  const queuedSamples = state.pendingSamples.filter(
    (s) => s.lotId === extractor.lotId
  ).length
  const samplesInProgress = extractor.samples.filter(
    (s) => s.status === Deposit.STATUSES.SAMPLING
  ).length

  return (
    <div
      className={cn('ring-ring flex flex-col gap-y-1 rounded-md px-2 py-1', {
        'ring-1': queuedSamples === 0,
        'ring-accent ring-2': queuedSamples > 0,
      })}
    >
      <div className='flex items-center justify-between gap-x-3'>
        <p className='text-2xl'>{extractor.name}</p>
        <div className='flex gap-x-3'>
          <ExtractorStatus extractor={extractor} />
          <div className='flex gap-x-1'>
            <MapPin /> {extractor.asteroidName}
          </div>
        </div>
      </div>
      <div className='flex justify-between gap-x-3'>
        <div className='flex items-center gap-x-3'>
          <StandardTooltip
            content={`${queuedSamples} ${pluralize(queuedSamples, 'sample')} queued`}
          >
            <div className='flex items-center gap-x-3'>
              <div
                className={cn('flex items-center gap-x-2', {
                  'text-accent': queuedSamples > 0,
                })}
              >
                <ShoppingCart />
                {queuedSamples}
              </div>
            </div>
          </StandardTooltip>
          {queueSample}
        </div>
        <div className='flex items-center gap-x-5'>
          <div className='flex items-center gap-x-3'>
            <StandardTooltip
              content={`${samplesInProgress} ${pluralize(samplesInProgress, 'sample')} in progress`}
            >
              <div className='flex items-center gap-x-1'>
                <Hourglass />
                {samplesInProgress}
              </div>
            </StandardTooltip>
          </div>
          <div className='flex items-center gap-x-3'>
            <StandardTooltip
              content={`${readySamples} ${pluralize(readySamples, 'sample')} ready`}
            >
              <div
                className={cn('flex items-center gap-x-1', {
                  'text-destructive': readySamples + samplesInProgress === 0,
                  'text-warning': readySamples + samplesInProgress === 1,
                  'text-success': readySamples + samplesInProgress > 1,
                })}
              >
                <Check />
                {readySamples}
              </div>
            </StandardTooltip>
            {details}
          </div>
        </div>
      </div>
    </div>
  )
}
