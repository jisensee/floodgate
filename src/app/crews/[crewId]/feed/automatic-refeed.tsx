'use client'

import { TabsContent } from '@radix-ui/react-tabs'
import { ReactNode, useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CircleCheck, Wheat } from 'lucide-react'
import { P, match } from 'ts-pattern'
import { InfluenceEntity, getEntityName } from 'influence-typed-sdk/api'
import { F, pipe } from '@mobily/ts-belt'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FloodgateCrew } from '@/lib/contract-types'
import { Format, cn, getFoodAmount } from '@/lib/utils'
import { getBuilding, getBuildingAtLot } from '@/actions'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'
import { useCrewRefeeding } from '@/hooks/contract'
import { useTransactionToast } from '@/hooks/transaction-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { FoodStatus } from '@/components/food-status'

type WarehouseNotFound = {
  type: 'not-found'
}
type WarehouseFound = {
  type: 'found'
  warehouse: InfluenceEntity
  foodAmount: number
}
type WarehouseResult = WarehouseNotFound | WarehouseFound
type SelectedTab = 'default' | 'manual'

export const Refeed = ({ crew }: { crew: FloodgateCrew }) => {
  const hasDefault = crew.feedingConfig.inventoryId > 0
  const [selectedTab, setSelectedTab] = useState<SelectedTab>(
    hasDefault ? 'default' : 'manual'
  )
  const [warehouseLotIndex, setWarehouseLotIndex] = useState<string>()
  const [selectedFoodAmount, setSelectedFoodAmount] = useState(0)

  const { warehouse, warehouseLoading, fetchWarehouse } = useFeedingWarehouse(
    crew,
    selectedTab,
    warehouseLotIndex
  )

  const { refeedLoading, refeedCrew } = useRefeedTx(
    crew,
    selectedTab,
    selectedFoodAmount,
    warehouse
  )

  return (
    <div className='flex w-full flex-col items-center gap-y-5'>
      <Tabs
        className='w-full'
        value={selectedTab}
        onValueChange={(value) => setSelectedTab(value as SelectedTab)}
      >
        <TabsList
          className={cn('grid', hasDefault ? 'grid-cols-2' : 'grid-cols-1')}
        >
          {hasDefault && (
            <TabsTrigger value='default'>From default</TabsTrigger>
          )}
          <TabsTrigger value='manual'>Manual</TabsTrigger>
        </TabsList>
        <TabsContent value='manual'>
          <Label className='mb-1'>Warehouse Lot Index</Label>
          <div className='flex gap-x-3'>
            <Input
              value={warehouseLotIndex}
              onChange={(e) =>
                setWarehouseLotIndex(e.target.value.replace(/[^0-9]/g, ''))
              }
            />
            <Button
              onClick={() => fetchWarehouse()}
              loading={warehouseLoading}
              disabled={!warehouseLotIndex}
              icon={<CircleCheck />}
            >
              Select
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {match([warehouse, warehouseLoading])
        .returnType<ReactNode>()
        .with([P._, true], () => (
          <div className='flex flex-col items-center gap-y-3'>
            <Skeleton className='h-16 w-32' />
            <Skeleton className='h-10 w-72' />
          </div>
        ))
        .with([{ type: 'not-found' }, false], () => (
          <Alert variant='destructive' className='text-center'>
            Selected warehouse does not exist.
          </Alert>
        ))
        .with([{ type: 'found', foodAmount: 0 }, false], ([{ warehouse }]) => (
          <Alert variant='destructive' className='text-center'>
            {getEntityName(warehouse)} has no food available.
          </Alert>
        ))
        .with(
          [{ type: 'found', foodAmount: P.number.gt(0) }, false],
          ([result]) => (
            <div className='flex flex-col items-center gap-y-2'>
              <p className='text-2xl'>{getEntityName(result.warehouse)}</p>
              <p className='text-success'>
                {Format.mass(result.foodAmount)} Food available
              </p>
              <FoodAmountSelection
                crew={crew}
                availableFood={result.foodAmount}
                selectedFoodAmount={selectedFoodAmount}
                onChange={setSelectedFoodAmount}
              />
            </div>
          )
        )
        .otherwise(() => null)}

      <Button
        variant='accent'
        icon={<Wheat />}
        loading={refeedLoading}
        onClick={() => refeedCrew()}
        disabled={
          warehouse?.type === 'not-found' ||
          !warehouse ||
          warehouse.foodAmount === 0 ||
          selectedFoodAmount === 0 ||
          selectedFoodAmount > crew.crewmateIds.length * 1000
        }
      >
        Refeed crew
      </Button>
    </div>
  )
}
type FoodAmountSelectionProps = {
  crew: FloodgateCrew
  availableFood: number
  selectedFoodAmount: number
  onChange: (amount: number) => void
}
const FoodAmountSelection = ({
  crew,
  availableFood,
  selectedFoodAmount,
  onChange,
}: FoodAmountSelectionProps) => {
  const crewFoodCapacity = 1_000 * crew.crewmateIds.length
  const crewCurrentFood = crew.currentFoodRatio * crewFoodCapacity
  const newFoodRatio = (crewCurrentFood + selectedFoodAmount) / crewFoodCapacity
  const maxFood = Math.floor(
    Math.min(
      availableFood,
      (1 - crew.currentFoodRatio) * 1_000 * crew.crewmateIds.length
    )
  )

  useEffect(() => {
    onChange(maxFood)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className='flex flex-col items-center gap-y-5'>
      <div className='flex gap-x-3'>
        <Input
          min={1}
          type='number'
          value={selectedFoodAmount}
          onChange={(e) =>
            onChange(
              pipe(
                parseInt(e.target.value),
                F.when(isNaN, () => 0)
              )
            )
          }
          endIcon='KG'
        />
        <Button onClick={() => onChange(maxFood)}>Use max</Button>
      </div>
      {newFoodRatio <= 1 ? (
        <div className='flex flex-col items-center'>
          <p className='text-sm'>This would feed the crew up to</p>
          <FoodStatus foodRatio={newFoodRatio} className='text-2xl' />
        </div>
      ) : (
        <p className='text-destructive'>
          The maximum amount of food you can feed to this crew is{' '}
          {Format.mass(maxFood)}
        </p>
      )}
    </div>
  )
}

const useFeedingWarehouse = (
  crew: FloodgateCrew,
  selectedTab: SelectedTab,
  warehouseLotIndex: string | undefined
) => {
  const defaultFeedingWarehouseId = crew.feedingConfig.inventoryId
  const {
    data: warehouse,
    isLoading: warehouseLoading,
    refetch: fetchWarehouse,
  } = useQuery<WarehouseResult>({
    queryKey: [
      'food-warehouse',
      selectedTab,
      defaultFeedingWarehouseId,
      warehouseLotIndex,
    ],
    enabled: selectedTab === 'default',
    queryFn: async () => {
      if (selectedTab === 'default') {
        const wh = await getBuilding(defaultFeedingWarehouseId)
        if (!wh?.Building) return { type: 'not-found' }
        return { type: 'found', warehouse: wh, foodAmount: getFoodAmount(wh) }
      } else if (selectedTab === 'manual' && warehouseLotIndex) {
        const wh = await getBuildingAtLot(
          crew.asteroidId,
          parseInt(warehouseLotIndex)
        )
        if (!wh?.Building) return { type: 'not-found' }
        return { type: 'found', warehouse: wh, foodAmount: getFoodAmount(wh) }
      }
      return { type: 'not-found' }
    },
  })

  return { warehouse, warehouseLoading, fetchWarehouse }
}

const useRefeedTx = (
  crew: FloodgateCrew,
  selectedTab: SelectedTab,
  selectedFoodAmount: number,
  warehouseResult?: WarehouseResult
) => {
  const { refresh } = useRouter()

  const {
    data: txData,
    write: refeedCrew,
    status: submitStatus,
    error: submitError,
  } = useCrewRefeeding({
    crewId: crew.id,
    amount: selectedFoodAmount,
    ...(selectedTab === 'default'
      ? {
          type: 'default',
        }
      : {
          type: 'manual',
          warehouseId:
            warehouseResult?.type === 'found'
              ? warehouseResult.warehouse.id
              : 0,
        }),
  })

  const { isLoading: refeedLoading } = useTransactionToast({
    txHash: txData?.transaction_hash,
    submitStatus,
    successMessage: 'Successfully refeed crew',
    submitError,
    pendingMessage: 'Refeeding crew...',
    onSuccess: refresh,
  })

  return {
    refeedLoading,
    refeedCrew,
  }
}
