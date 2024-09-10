import { Asteroid, Deposit, Entity, Lot, Product } from '@influenceth/sdk'
import { Dispatch, useMemo, useState } from 'react'
import { A, N, O, pipe } from '@mobily/ts-belt'
import { getEntityName } from 'influence-typed-sdk/api'
import { ClockArrowUp, Minus, Plus, TrendingUp } from 'lucide-react'
import { isFuture } from 'date-fns'
import { differenceInSeconds } from 'date-fns/fp'
import {
  CoreDrillWarehouse,
  MiningCompanionCrew,
  MiningCompanionExtractor,
} from './actions'
import { Action } from './state'
import {
  useCoreDrillWarehouse,
  useSampleCrew,
  useSampleResource,
} from './hooks'
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CrewmateImage, ProductImage } from '@/components/asset-images'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Format, pluralize } from '@/lib/utils'
import { StandardTooltip } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'

export type AddSampleProps = {
  dispatch: Dispatch<Action>
  extractor: MiningCompanionExtractor
  crews: MiningCompanionCrew[]
  coreDrillWarehouses: CoreDrillWarehouse[]
  onClose: () => void
}

export const AddSample = ({
  dispatch,
  extractor,
  crews,
  coreDrillWarehouses,
  onClose,
}: AddSampleProps) => {
  const [sampleCount, setSampleCount] = useState(1)

  const { resource, setResource } = useSampleResource(
    extractor.lotId,
    extractor.resourceAbundances[0]?.resource
  )
  const { warehouseId, setWarehouseId } = useCoreDrillWarehouse(
    extractor.lotId,
    coreDrillWarehouses[0]?.id
  )

  const { crewId, setCrewId } = useSampleCrew(extractor.lotId, crews[0]?.id)

  const selectedWarehouse = coreDrillWarehouses.find(
    (wh) => wh.id === warehouseId
  )
  const sampleDetails = useMemo(() => {
    const crew = crews.find((c) => c.id === crewId)
    const abundance = extractor.resourceAbundances.find(
      (a) => a.resource === resource
    )?.abundance
    if (!crew || !abundance) return

    const sampleTime = Deposit.getSampleTime(1 + crew.bonuses.sampleSpeed)
    const { lower, upper } = Deposit.getSampleBounds(
      abundance,
      0,
      crew.bonuses.sampleQuality
    )
    return {
      lower,
      upper,
      sampleTime,
    }
  }, [crews, crewId, resource, extractor.resourceAbundances])

  const onQueueSample = () => {
    if (crewId && resource && selectedWarehouse) {
      dispatch({
        type: 'queue-samples',
        samples: A.make(sampleCount, {
          lotId: extractor.lotId,
          crewId: crewId,
          resource,
          asteroidName: extractor.asteroidName,
          extractorName: extractor.name,
          origin: {
            id: selectedWarehouse.id,
            slot: selectedWarehouse.slot,
            label: Entity.IDS.BUILDING,
          },
        }),
      })
      onClose()
    }
  }
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className='text-2xl'>New Core Sample</DialogTitle>
      </DialogHeader>
      <ResourceSelect
        resourceAbundances={extractor.resourceAbundances}
        selectedResource={resource}
        onResourceChage={setResource}
      />
      <WarehouseSelect
        warehouses={coreDrillWarehouses}
        selectedWarehouse={warehouseId}
        onWarehouseChange={setWarehouseId}
      />
      <CrewSelect
        crews={crews}
        extractor={extractor}
        selectedCrew={crewId}
        onCrewChange={setCrewId}
      />
      {sampleDetails && (
        <div className='grid grid-cols-[min-content,1fr] gap-x-5 gap-y-1'>
          <p className='whitespace-nowrap'>Discovery Minimum</p>
          <p>{Format.mass(sampleDetails.lower / 1_000)}</p>
          <p className='whitespace-nowrap'>Discovery Maximum</p>
          <p>{Format.mass(sampleDetails.upper / 1_000)}</p>
          <p className='whitespace-nowrap'>Sample Time</p>
          <p>{Format.duration(sampleDetails.sampleTime / 24)}</p>
        </div>
      )}
      <DialogFooter>
        <Button variant='outline' onClick={onClose}>
          Close
        </Button>
        <div className='mr-2 flex items-center gap-x-2'>
          <Button
            className='h-8 w-8'
            size='icon'
            disabled={sampleCount === 1}
            onClick={() => setSampleCount(N.pred)}
          >
            <Minus size={16} />
          </Button>
          <p className='font-mono text-xl'>{sampleCount}</p>
          <Button
            className='h-8 w-8'
            size='icon'
            onClick={() => setSampleCount(N.succ)}
          >
            <Plus size={16} />
          </Button>
        </div>
        <Button
          className='w-40'
          onClick={onQueueSample}
          disabled={!crewId || !resource || !warehouseId}
        >
          Queue {sampleCount} {pluralize(sampleCount, 'sample')}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

type ResourceSelectProps = {
  resourceAbundances: MiningCompanionExtractor['resourceAbundances']
  selectedResource?: number
  onResourceChage: (resource: number) => void
}
const ResourceSelect = ({
  resourceAbundances,
  selectedResource,
  onResourceChage,
}: ResourceSelectProps) => (
  <div>
    <Label>Resource</Label>
    <Select
      value={selectedResource?.toString()}
      onValueChange={(v) => onResourceChage(parseInt(v))}
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {resourceAbundances.map(({ abundance, resource }) => (
          <SelectItem key={resource} value={resource.toString()}>
            <div className='flex gap-x-2'>
              <ProductImage productId={resource} width={24} />
              {(abundance * 100).toFixed(1)}% {Product.getType(resource).name}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
)

type CrewSelectProps = {
  crews: MiningCompanionCrew[]
  extractor: MiningCompanionExtractor
  selectedCrew?: number
  onCrewChange: (crew: number) => void
}

const CrewSelect = ({
  crews,
  extractor,
  selectedCrew,
  onCrewChange,
}: CrewSelectProps) => {
  return (
    <div>
      <Label>Crew</Label>
      <Select
        value={selectedCrew?.toString()}
        onValueChange={(v) => onCrewChange(parseInt(v))}
      >
        <SelectTrigger className='h-fit'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {crews.map((crew) => {
            const distance = Asteroid.getLotDistance(
              extractor.asteroidId,
              Lot.toIndex(extractor.lotId),
              Lot.toIndex(
                crew.station.Location?.resolvedLocations?.lot?.id ?? 0
              )
            )
            const readyAt = pipe(
              crew.Crew?.readyAtTimestamp,
              O.filter(isFuture),
              O.map(differenceInSeconds(new Date())),
              O.map(Format.duration)
            )
            return (
              <SelectItem
                key={crew.id}
                value={crew.id.toString()}
                className='group'
              >
                <div className='flex items-start gap-x-2'>
                  <CrewmateImage
                    width={64}
                    crewmateId={crew.crewmates[0]?.id ?? 0}
                  />
                  <div className='flex flex-col items-start gap-y-2'>
                    <div className='flex items-center justify-between gap-x-5'>
                      <p className='text-lg'>{getEntityName(crew)}</p>
                      {readyAt ? (
                        <p>
                          Ready in <span className='font-bold'>{readyAt}</span>
                        </p>
                      ) : (
                        <p className='font-bold uppercase'>Ready</p>
                      )}
                    </div>
                    <p>
                      <span className='font-bold'>
                        {Format.distance(distance)}
                      </span>{' '}
                      to {extractor.name}
                    </p>
                    <div className='flex gap-x-3'>
                      <StandardTooltip content='Core Sample Quality'>
                        <div className='flex items-center gap-x-2 text-success group-focus:text-primary-foreground'>
                          <TrendingUp />
                          {Math.round((crew.bonuses.sampleQuality - 1) * 100)}%
                        </div>
                      </StandardTooltip>
                      <StandardTooltip content='Core Sample Time'>
                        <div className='flex items-center gap-x-2 text-success group-focus:text-primary-foreground'>
                          <ClockArrowUp />
                          {Math.round(crew.bonuses.sampleSpeed * 100)}%
                        </div>
                      </StandardTooltip>
                    </div>
                  </div>
                </div>
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
    </div>
  )
}

type WarehouseSelectProps = {
  warehouses: CoreDrillWarehouse[]
  selectedWarehouse?: number
  onWarehouseChange: (warehouse: number) => void
}
const WarehouseSelect = ({
  warehouses,
  selectedWarehouse,
  onWarehouseChange,
}: WarehouseSelectProps) => (
  <div>
    <Label>Core Drill Source</Label>
    <Select
      value={selectedWarehouse?.toString()}
      onValueChange={(v) => onWarehouseChange(parseInt(v))}
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {warehouses.map((wh) => (
          <SelectItem key={wh.id} value={wh.id.toString()}>
            {wh.name} - {wh.coreDrills} remaining
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
)
