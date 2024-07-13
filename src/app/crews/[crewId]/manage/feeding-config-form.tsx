'use client'

import { InfluenceEntity, getEntityName } from 'influence-typed-sdk/api'
import { Entity, Product } from '@influenceth/sdk'
import { useMemo, useState } from 'react'
import { Save } from 'lucide-react'
import { FloodgateCrew } from '@/lib/contract-types'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { InfoTooltip } from '@/components/ui/tooltip'
import { Format, cn, getFoodAmount } from '@/lib/utils'
import { ProductImage, WarehouseImage } from '@/components/asset-images'
import { Input } from '@/components/ui/input'
import { useSetFeedingConfig } from '@/hooks/contract'
import { useTransactionToast } from '@/hooks/transaction-toast'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'

export type FeedingConfigFormProps = {
  crew: FloodgateCrew
  availableWarehouses: InfluenceEntity[]
}
export const FeedingConfigForm = ({
  crew,
  availableWarehouses,
}: FeedingConfigFormProps) => {
  const [enabled, setEnabled] = useState(
    crew.feedingConfig.automaticFeedingEnabled
  )
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(
    crew.feedingConfig.inventoryType === Entity.IDS.BUILDING
      ? crew.feedingConfig.inventoryId
      : undefined
  )
  const {
    write: setConfig,
    data,
    status,
    error,
  } = useSetFeedingConfig(crew.id, enabled, selectedWarehouseId ?? 0)

  const { isLoading } = useTransactionToast({
    txHash: data?.transaction_hash,
    submitStatus: status,
    submitError: error,
    pendingMessage: 'Setting feeding config...',
    successMessage: 'Feeding config set',
  })

  const selectedWarehouse = useMemo(
    () => availableWarehouses.find((wh) => wh.id === selectedWarehouseId),
    [selectedWarehouseId, availableWarehouses]
  )

  return (
    <div className='flex flex-col gap-y-2'>
      <div className='grid grid-cols-[min-content,1fr] gap-x-5 gap-y-2'>
        <div className='flex items-center gap-x-3'>
          <Label htmlFor='enabled' className='text-base'>
            Automatic Feeding
          </Label>
          <InfoTooltip size={20}>
            If enabled, the Floodgate contract will automatically refeed this
            crew with food from the configured warehouse.
          </InfoTooltip>
        </div>
        <Switch id='enabled' checked={enabled} onCheckedChange={setEnabled} />

        <div className='flex items-center gap-x-3'>
          <Label htmlFor='warehouse-id' className='whitespace-nowrap text-base'>
            Selected Warehouse ID
          </Label>
          <InfoTooltip size={20}>
            The warehouse that will be used for feeding this crew. You can enter
            a ID manually but then have to make sure that the crew has access.
          </InfoTooltip>
        </div>
        <Input
          id='warehouse-id'
          inputClassName='h-8 mr-2'
          type='number'
          disabled={!enabled}
          value={selectedWarehouseId}
          onChange={(e) => setSelectedWarehouseId(parseInt(e.target.value))}
        />
        {!selectedWarehouse && selectedWarehouseId !== undefined && (
          <Alert className='col-span-2' variant='warning'>
            You have selected a warehouse that the crew is not whitelisted for.
            Please make sure that the crew is permitted to remove products from
            this warehouse before saving this configuration.
          </Alert>
        )}
      </div>
      {availableWarehouses.length > 0 ? (
        <>
          <h3>Available Warehouses</h3>
          <div
            className={cn('flex max-h-72 flex-col gap-y-2 overflow-y-auto', {
              'cursor-not-allowed opacity-50': !enabled,
            })}
          >
            {availableWarehouses.map((wh) => (
              <WarehouseEntry
                key={wh.id}
                warehouse={wh}
                enabled={enabled}
                selected={wh.id === selectedWarehouseId}
                onSelect={() => setSelectedWarehouseId(wh.id)}
              />
            ))}
          </div>
        </>
      ) : (
        <Alert variant='warning' className='text-center'>
          No warehouses that this crew has access to found. Please whitelist the
          crew for a warehouse or enter a warehouse ID manually.
        </Alert>
      )}
      <Alert variant='default' className='text-center'>
        To protect the assets of your selected warehouse, Floodgate will not
        allow any products to be transferred out of it through any service.
      </Alert>
      <div className='flex justify-center'>
        <Button
          className='w-fit'
          variant='accent'
          onClick={() => setConfig()}
          loading={isLoading}
          disabled={enabled && !selectedWarehouseId}
          icon={<Save />}
        >
          Save config
        </Button>
      </div>
    </div>
  )
}

const WarehouseEntry = ({
  warehouse,
  selected,
  onSelect,
  enabled,
}: {
  warehouse: InfluenceEntity
  selected: boolean
  onSelect: () => void
  enabled: boolean
}) => {
  const foodAmount = getFoodAmount(warehouse)

  return (
    <div
      className={cn('flex items-center gap-x-2 rounded px-1 py-2', {
        'bg-muted': selected,
        'cursor-pointer hover:bg-muted': enabled,
        'cursor-not-allowed': !enabled,
      })}
      onClick={enabled ? onSelect : undefined}
    >
      <WarehouseImage size={100} />
      <div className='flex flex-col gap-y-1'>
        <p className='text-base font-bold'>{getEntityName(warehouse)}</p>
        <div className='flex items-center gap-x-2'>
          <ProductImage productId={Product.IDS.FOOD} width={30} />
          <p>{Format.mass(foodAmount)} Food available</p>
        </div>
      </div>
    </div>
  )
}
