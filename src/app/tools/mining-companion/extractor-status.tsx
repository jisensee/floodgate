import { Hourglass, Pickaxe } from 'lucide-react'
import { Product } from '@influenceth/sdk'
import { differenceInSeconds } from 'date-fns/fp'
import { pipe } from '@mobily/ts-belt'
import { formatRelative, isFuture } from 'date-fns'
import { MiningCompanionExtractor } from './actions'
import { Format } from '@/lib/utils'
import { ProductImage } from '@/components/asset-images'
import { StandardTooltip } from '@/components/ui/tooltip'

export type ExtractorStatusProps = {
  extractor: MiningCompanionExtractor
}

export const ExtractorStatus = ({ extractor }: ExtractorStatusProps) => {
  const extraction = extractor.runningExtraction
  const remainingTime =
    extraction && isFuture(extraction.finishTimestamp)
      ? pipe(
          extraction.finishTimestamp,
          differenceInSeconds(new Date()),
          (seconds) => Format.duration(seconds, 2)
        )
      : undefined

  if (extraction && extraction.outputProduct && remainingTime) {
    const resourceName = Product.getType(extraction.outputProduct).name
    return (
      <StandardTooltip
        content={
          <p>
            Extracting{' '}
            <span className='font-bold'>
              {Format.mass(extraction.yield, 't')}
            </span>{' '}
            {resourceName}, finishing{' '}
            <span className='font-bold'>
              {formatRelative(extraction.finishTimestamp, new Date())}
            </span>
          </p>
        }
      >
        <div className='flex items-center gap-x-1'>
          <Pickaxe />
          <span>{remainingTime}</span>
          <ProductImage productId={extraction.outputProduct} width={24} />
          <span>{resourceName}</span>
        </div>
      </StandardTooltip>
    )
  }
  return (
    <div className='flex items-center gap-x-1 text-warning'>
      <Hourglass /> <span>Idle</span>
    </div>
  )
}
