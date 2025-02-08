import { Dispatch, Fragment } from 'react'
import { Deposit, Lot, Product } from '@influenceth/sdk'
import { Check, Hourglass, MapPin, ShoppingCart, Trash } from 'lucide-react'
import { differenceInSeconds, isBefore } from 'date-fns'
import { A, pipe } from '@mobily/ts-belt'
import { MiningCompanionExtractor } from './actions'
import { Action, State } from './state'
import { ExtractorStatus } from './extractor-status'
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ProductImage } from '@/components/asset-images'
import { Format } from '@/lib/utils'

export type ExtractorDetailsProps = {
  extractor: MiningCompanionExtractor
  state: State
  dispatch: Dispatch<Action>
  onQueueSample: () => void
  onClose: () => void
}
export const ExtractorDetails = ({
  extractor,
  state,
  dispatch,
  onQueueSample,
  onClose,
}: ExtractorDetailsProps) => {
  const pendingSamples = state.pendingSamples.filter(
    (s) => s.lotId === extractor.lotId
  )
  const queuedSampleList = pendingSamples.length > 0 && (
    <div className='space-y-2'>
      <h3>
        <ShoppingCart className='inline' /> Queued Samples
      </h3>
      <div className='grid grid-cols-[auto_1fr] items-center gap-x-5'>
        {pendingSamples.map((s) => (
          <Fragment key={s.uuid}>
            <div className='flex items-center gap-x-2'>
              <ProductImage productId={s.resource} width={36} />
              <div>{Product.getType(s.resource).name}</div>
            </div>
            <Button
              className='h-8 w-8'
              size='icon'
              variant='destructive'
              onClick={() => dispatch({ type: 'remove-sample', uuid: s.uuid })}
            >
              <Trash size={16} />
            </Button>
          </Fragment>
        ))}
      </div>
    </div>
  )
  const availableSamples = extractor.samples.filter(
    (s) => s.status === Deposit.STATUSES.SAMPLED
  )

  const availableSamplesList = availableSamples.length > 0 && (
    <div className='space-y-2'>
      <h3>
        <Check className='inline' /> Ready Samples
      </h3>
      <div>
        <div className='grid grid-cols-[auto_1fr] items-center gap-x-5'>
          {availableSamples.map((sample) => (
            <Fragment key={sample.finishTime}>
              <div className='flex items-center gap-x-2'>
                <ProductImage productId={sample.resource} width={36} />
                <div>{Product.getType(sample.resource).name}</div>
              </div>
              <p>{Format.mass(sample.remainingYield, 't')}</p>
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  )
  const samplesInProgress = pipe(
    extractor.samples,
    A.filter((s) => s.status === Deposit.STATUSES.SAMPLING),
    A.sortBy((s) => s.finishTime)
  )

  const samplesInProgressList = samplesInProgress.length > 0 && (
    <div className='space-y-2'>
      <h3>
        <Hourglass className='inline' /> Samples In Progress
      </h3>
      <div>
        <div className='grid grid-cols-[auto_1fr] items-center gap-x-5'>
          {samplesInProgress.map((sample) => (
            <Fragment key={sample.finishTime}>
              <div className='flex items-center gap-x-2'>
                <ProductImage productId={sample.resource} width={36} />
                <div>{Product.getType(sample.resource).name}</div>
              </div>
              <p>
                {isBefore(sample.finishTimestamp, new Date())
                  ? 'Finished'
                  : Format.duration(
                      differenceInSeconds(sample.finishTimestamp, new Date())
                    )}
              </p>
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <DialogContent>
      <DialogHeader>
        <div className='flex items-center gap-x-5'>
          <DialogTitle className='text-2xl'>{extractor.name}</DialogTitle>
          <ExtractorStatus extractor={extractor} />
        </div>
        <div className='flex items-center gap-x-2'>
          <MapPin />{' '}
          <span>
            {extractor.asteroidName} - #
            {Lot.toIndex(extractor.lotId).toLocaleString()}
          </span>
        </div>
      </DialogHeader>
      {queuedSampleList}
      {samplesInProgressList}
      {availableSamplesList}
      <DialogFooter>
        <Button onClick={onClose} variant='outline'>
          Close
        </Button>
        <Button onClick={onQueueSample}>Queue Sample</Button>
      </DialogFooter>
    </DialogContent>
  )
}
