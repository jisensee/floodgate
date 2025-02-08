import { A, D, F, pipe } from '@mobily/ts-belt'
import { Fragment } from 'react'
import { Product } from '@influenceth/sdk'
import { PendingSample, State } from './state'
import { SwayAmount } from '@/components/sway-amount'
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { StandardTooltip } from '@/components/ui/tooltip'
import { ProductImage } from '@/components/asset-images'

export type SummaryProps = {
  state: State
  fee: bigint
  onClose: () => void
}

export const Summary = ({ state, fee, onClose }: SummaryProps) => {
  const data = pipe(
    state.pendingSamples,
    A.groupBy((s) => s.asteroidName),
    D.map((asteroidSamples) =>
      A.groupBy(F.toMutable(asteroidSamples) ?? [], (s) => s.extractorName)
    )
  )
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className='text-2xl'>Summary</DialogTitle>
      </DialogHeader>
      <div className='flex items-center gap-x-2'>
        <span className='font-bold'>Floodgate Fee:</span>
        <SwayAmount amount={fee} convert />
      </div>

      <div>
        {D.toPairs(data).map(([asteroid, extractorData]) => (
          <div key={asteroid}>
            <h3>{asteroid}</h3>
            <div className='grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1'>
              {D.toPairs(extractorData).map(([extractor, samples]) => (
                <ExtractorEntry
                  key={extractor}
                  extractor={extractor}
                  samples={F.toMutable(samples ?? [])}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <DialogFooter>
        <Button variant='outline' onClick={onClose}>
          Close
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

type ExtractorEntryProps = {
  extractor: string
  samples: PendingSample[]
}
const ExtractorEntry = ({ extractor, samples }: ExtractorEntryProps) => {
  const groupedResources = pipe(
    samples,
    A.groupBy((s) => s.resource),
    D.map((s) => s?.length ?? 0),
    D.toPairs,
    A.map(([resource, count]) => ({ resource: parseInt(resource), count }))
  )

  return (
    <Fragment key={extractor}>
      <span>{extractor}</span>
      <div className='flex gap-x-2'>
        {groupedResources.map(({ resource, count }) => (
          <StandardTooltip
            key={resource}
            content={Product.getType(resource).name}
          >
            <div className='flex items-center gap-x-1'>
              <ProductImage productId={resource} width={24} />
              <span>{count}</span>
            </div>
          </StandardTooltip>
        ))}
      </div>
    </Fragment>
  )
}
