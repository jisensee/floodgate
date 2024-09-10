import {
  Dispatch,
  PropsWithChildren,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Eye, EyeOff, Plus, Save, Trash, X } from 'lucide-react'
import {
  Entity,
  Inventory as SdkInventory,
  Product,
  ProductType,
  Ship,
} from '@influenceth/sdk'
import { A, O, flow, pipe } from '@mobily/ts-belt'
import { ProductAmount } from 'influence-typed-sdk/api'
import { Action, Delivery, getDeliveriesContents } from './state'
import { InventoryCard } from './inventory-card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  BuildingImage,
  ProductImage,
  ShipImage,
} from '@/components/asset-images'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Format, calcMassAndVolume, cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { StandardTooltip } from '@/components/ui/tooltip'
import { FloodgateCrew } from '@/lib/contract-types'
import { Inventory } from '@/inventory-actions'
import { Alert } from '@/components/ui/alert'
import {
  InventoryFilters,
  useInventoryFilters,
} from '@/components/inventory-filters'

export type SelectGoodsStepProps = {
  inventories: Inventory[]
  destination: Inventory
  deliveries: Delivery[]
  crew: FloodgateCrew
  dispatch: Dispatch<Action>
}

export const SelectGoodsStep = ({
  inventories,
  destination,
  deliveries,
  crew,
  dispatch,
}: SelectGoodsStepProps) => {
  const [addSourceDialogOpen, setAddSourceDialogOpen] = useState(false)
  const [openDeliveries, setOpenDeliveries] = useState<string[]>([])

  const availableSources = inventories.filter(
    (i) =>
      destination.inventoryUuid !== i.inventoryUuid &&
      i.contents.length > 0 &&
      !deliveries.find((d) => d.source.inventoryUuid === i.inventoryUuid)
  )
  const { remainingDestinationMass, remainingDestinationVolume } =
    useDeliveryImpact(destination, deliveries, crew)

  return (
    <div className='flex flex-col gap-y-1'>
      <div className='flex flex-col gap-y-5'>
        <DestinationPreview
          destination={destination}
          deliveries={deliveries}
          crew={crew}
        />
        <AddSourceDialog
          open={addSourceDialogOpen}
          onOpenChange={setAddSourceDialogOpen}
          sources={availableSources}
          onSelect={(i) => {
            dispatch({
              type: 'add-delivery',
              source: i,
            })
            setAddSourceDialogOpen(false)
            setOpenDeliveries((prev) => [...prev, i.inventoryUuid])
          }}
        />
      </div>
      <Accordion
        type='multiple'
        value={openDeliveries}
        onValueChange={setOpenDeliveries}
      >
        {deliveries.map((delivery) => (
          <AccordionItem
            key={delivery.source.inventoryUuid}
            value={delivery.source.inventoryUuid}
          >
            <AccordionTrigger className='pb-2'>
              <DeliveryCard
                key={delivery.source.inventoryUuid}
                delivery={delivery}
              />
            </AccordionTrigger>
            <AccordionContent>
              <ProductList
                delivery={delivery}
                destination={destination}
                remainingMass={remainingDestinationMass}
                remainingVolume={remainingDestinationVolume}
                dispatch={dispatch}
              />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

const useDeliveryImpact = (
  destination: Inventory,
  deliveries: Delivery[],
  crew: FloodgateCrew
) => {
  const { mass: destMass, volume: destVolume } = calcMassAndVolume(
    destination.contents
  )
  const usedDestinationMass = destMass + destination.reservedMass / 1000
  const usedDestinationVolume = destVolume + destination.reservedVolume / 1000

  const { mass: deliveryMass, volume: deliveryVolume } = calcMassAndVolume(
    getDeliveriesContents(deliveries)
  )

  const remainingDestinationMass =
    destination.massCapacity * crew.bonuses.massCapacity.totalBonus -
    usedDestinationMass -
    deliveryMass
  const remainingDestinationVolume =
    destination.volumeCapacity * crew.bonuses.volumeCapacity.totalBonus -
    usedDestinationVolume -
    deliveryVolume

  return {
    remainingDestinationMass,
    remainingDestinationVolume,
    usedDestinationMass,
    usedDestinationVolume,
    deliveryMass,
    deliveryVolume,
  }
}

const DestinationPreview = ({
  destination,
  deliveries,
  crew,
}: {
  destination: Inventory
  deliveries: Delivery[]
  crew: FloodgateCrew
}) => {
  const {
    usedDestinationMass,
    usedDestinationVolume,
    deliveryMass,
    deliveryVolume,
  } = useDeliveryImpact(destination, deliveries, crew)
  const newDestinationMass = usedDestinationMass + deliveryMass
  const newDestinationVolume = usedDestinationVolume + deliveryVolume

  const maxDestinationMass =
    destination.massCapacity * crew.bonuses.massCapacity.totalBonus
  const maxDestinationVolume =
    destination.volumeCapacity * crew.bonuses.volumeCapacity.totalBonus

  return (
    <div className='flex flex-col gap-y-1'>
      <h3>{destination.entity.name}</h3>
      <div>
        <p>
          Mass: {Format.mass(newDestinationMass)} /{' '}
          {Format.mass(maxDestinationMass)}{' '}
        </p>
        <Progress
          className='h-2'
          indicators={[
            {
              position: 1,
              value: (newDestinationMass / maxDestinationMass) * 100,
              className: 'bg-primary',
            },
            {
              position: 2,
              value: (usedDestinationMass / maxDestinationMass) * 100,
              className: 'bg-white',
            },
          ]}
        />
      </div>
      <div>
        <p>
          Volume: {Format.volume(newDestinationVolume)} /{' '}
          {Format.volume(maxDestinationVolume)}{' '}
        </p>
        <Progress
          className='h-2'
          indicators={[
            {
              position: 1,
              value: (newDestinationVolume / maxDestinationVolume) * 100,
              className: 'bg-primary',
            },
            {
              position: 2,
              value: (usedDestinationVolume / maxDestinationVolume) * 100,
              className: 'bg-white',
            },
          ]}
        />
      </div>
    </div>
  )
}

const getInventoryImage = (inventory: Inventory) => {
  if (inventory.entity.label === Entity.IDS.SHIP) {
    return <ShipImage type={Ship.getType(inventory.entity.type)} size={100} />
  }
  return <BuildingImage buildingId={inventory.entity.type} size={100} />
}

type DeliveryCardProps = {
  delivery: Delivery
}
const DeliveryCard = ({ delivery }: DeliveryCardProps) => {
  const { source, contents } = delivery
  const image = getInventoryImage(source)

  const selectedCount = contents.filter((c) => c.amount > 0).length
  return (
    <div className='flex gap-x-2 text-left text-base font-normal'>
      {image}
      <div className='flex flex-col gap-y-1'>
        <p className='font-bold'>{source.entity.name}</p>
        <p>
          {selectedCount} / {source.contents.length} items selected
        </p>
      </div>
    </div>
  )
}

type AddSourceDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  sources: Inventory[]
  onSelect: (inventory: Inventory) => void
}
const AddSourceDialog = ({
  open,
  onOpenChange,
  sources,
  onSelect,
}: AddSourceDialogProps) => {
  const { filteredInventories, filtersProps } = useInventoryFilters(sources)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button icon={<Plus />} onClick={() => onOpenChange(true)}>
          Add source
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className='text-2xl'>Add source</DialogTitle>
        </DialogHeader>
        <div className='flex max-h-[80vh] flex-col gap-y-2 overflow-y-auto p-1'>
          <InventoryFilters {...filtersProps} />
          <div className='flex flex-col gap-y-1'>
            {pipe(
              filteredInventories,
              A.map((source) => (
                <InventoryCard
                  key={source.inventoryUuid}
                  inventory={source}
                  onSelect={() => onSelect(source)}
                />
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

type ProductListProps = {
  delivery: Delivery
  destination: Inventory
  remainingMass: number
  remainingVolume: number
  dispatch: Dispatch<Action>
}
const ProductList = ({
  delivery,
  destination,
  remainingMass,
  remainingVolume,
  dispatch,
}: ProductListProps) => {
  const [productFilter, setProductFilter] = useState('')
  const [hideUnselected, setHideUnselected] = useState(false)

  const allowedProducts =
    pipe(
      destination.inventoryType,
      SdkInventory.getType,
      (s) => s.productConstraints ?? undefined,
      O.map(flow(Object.keys, A.map(parseInt)))
    ) ?? []

  const hasProductConstraints = allowedProducts.length > 0
  const hasForbiddenProducts =
    hasProductConstraints &&
    delivery.source.contents.some((c) => !allowedProducts.includes(c.product))

  const isAllowedProduct = (product: ProductAmount) =>
    !hasProductConstraints || allowedProducts.includes(product.product)

  const shownProducts = delivery.source.contents
    .filter(isAllowedProduct)
    .filter(({ product }) => {
      const selected =
        delivery.contents.find((c) => c.product === product)?.amount ?? 0
      return !hideUnselected || selected > 0
    })
    .filter(
      ({ product }) =>
        productFilter === '' ||
        Product.getType(product)
          .name.toLowerCase()
          .includes(productFilter.toLowerCase())
    )

  return (
    <div className='flex flex-col gap-y-2 p-1'>
      <div className='flex gap-x-2'>
        <Input
          value={productFilter}
          onChange={(e) => setProductFilter(e.target.value)}
          placeholder='Product name'
          endIcon={
            <X
              className='cursor-pointer'
              onClick={() => setProductFilter('')}
            />
          }
        />
        <StandardTooltip
          content={
            hideUnselected ? 'Show all products' : 'Show only selected products'
          }
        >
          <Button
            variant='ghost'
            icon={hideUnselected ? <Eye /> : <EyeOff />}
            onClick={() => setHideUnselected((s) => !s)}
          />
        </StandardTooltip>
        <Button
          variant='destructive'
          icon={<Trash />}
          onClick={() =>
            dispatch({
              type: 'remove-delivery',
              deliverySourceUuid: delivery.source.inventoryUuid,
            })
          }
        >
          Remove
        </Button>
      </div>
      {hasForbiddenProducts && (
        <Alert variant='warning'>
          Not all products are shown since the destination has product
          restrictions.
        </Alert>
      )}
      <div className='fit flex flex-wrap gap-1'>
        {shownProducts.length === 0 && (
          <div className='flex w-full flex-col items-center gap-y-2 py-3'>
            <p className='text-xl text-muted-foreground'>
              No products matching your filter
            </p>
            <Button
              onClick={() => {
                setProductFilter('')
                setHideUnselected(false)
              }}
            >
              Reset filters
            </Button>
          </div>
        )}
        {shownProducts.length > 0 &&
          shownProducts.map(({ product, amount }) => {
            const selected =
              delivery.contents.find((c) => c.product === product)?.amount ?? 0
            return (
              <ProductSelectionDialog
                key={product}
                delivery={delivery}
                product={Product.getType(product)}
                remainingMass={remainingMass}
                remainingVolume={remainingVolume}
                dispatch={dispatch}
              >
                <div
                  className={cn(
                    'relative cursor-pointer rounded border border-muted',
                    {
                      'border-primary': selected > 0,
                    }
                  )}
                >
                  <p className='absolute left-0 top-0 bg-background/75 p-1 text-xs text-foreground'>
                    {Product.getType(product).name}
                  </p>
                  <p
                    className={cn(
                      'absolute bottom-0 left-0 bg-background/75 p-1 text-xs text-foreground'
                    )}
                  >
                    {selected > 0
                      ? `${Format.productMass({ product, amount: selected })} / ${Format.productMass({ product, amount })}`
                      : Format.productMass({ product, amount })}
                  </p>
                  <ProductImage width={90} productId={product} />
                </div>
              </ProductSelectionDialog>
            )
          })}
      </div>
    </div>
  )
}

type ProductSelectionDialogProps = {
  delivery: Delivery
  product: ProductType
  remainingMass: number
  remainingVolume: number
  dispatch: Dispatch<Action>
} & PropsWithChildren

const ProductSelectionDialog = ({
  delivery,
  product,
  dispatch,
  remainingMass: remainingDestinationMass,
  remainingVolume: remainingDestinationVolume,
  children,
}: ProductSelectionDialogProps) => {
  const [open, setOpen] = useState(false)
  const [unit, setUnit] = useState<'kg' | 't' | 'pieces'>(
    product.isAtomic ? 'pieces' : 't'
  )

  const selectedMass =
    delivery.contents.find((c) => c.product === product.i)?.amount ?? 0

  const totalMass =
    delivery.source.contents.find((c) => c.product === product.i)?.amount ?? 0
  const totalVolume = calcMassAndVolume([
    { product: product.i, amount: totalMass },
  ]).volume

  const [newAmount, setNewAmount] = useState(selectedMass)

  useEffect(() => {
    if (open) {
      setNewAmount(selectedMass)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const { volume: newVolume } = calcMassAndVolume([
    { product: product.i, amount: newAmount },
  ])

  const newRemainingMass = totalMass - newAmount
  const newRemainingVolume = totalVolume - newVolume

  const maxAmount = useMemo(() => {
    const remainingAmountByVolume =
      1 / (product.volumePerUnit / 1000 / remainingDestinationVolume)

    return Math.min(
      remainingDestinationMass + selectedMass,
      remainingAmountByVolume
    )
  }, [
    product.volumePerUnit,
    remainingDestinationMass,
    remainingDestinationVolume,
    selectedMass,
  ])

  const saveAmount = (amount: number) => {
    dispatch({
      type: 'update-delivery',
      deliverySourceUuid: delivery.source.inventoryUuid,
      newContents: delivery.contents.map((productAmount) =>
        productAmount.product === product.i
          ? { ...productAmount, amount }
          : productAmount
      ),
    })
    setOpen(false)
  }

  const handleAmountChange = (amount: number) =>
    setNewAmount(unit === 't' ? amount * 1000 : amount)

  const handleTakeAll = () => {
    saveAmount(Math.min(totalMass, maxAmount))
  }
  const notEnoughInventory = newRemainingMass < 0
  const notEnoughDestinationSpace = newAmount > maxAmount
  const canTakeAll = totalMass <= maxAmount

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='max-w-[26rem]'>
        <DialogHeader>
          <div className='flex items-center gap-x-2'>
            <ProductImage width={40} productId={product.i} />
            <DialogTitle className='text-2xl'>{product.name}</DialogTitle>
          </div>
        </DialogHeader>
        <div>
          <Label className='text-sm'>Amount</Label>
          <div className='flex items-center gap-x-3'>
            <Input
              type='number'
              min={0}
              value={unit === 't' ? newAmount / 1000 : newAmount}
              onChange={(e) => handleAmountChange(parseInt(e.target.value))}
            />
            {!product.isAtomic && (
              <div className='flex'>
                <Button
                  className='rounded-r-none'
                  variant={unit === 'kg' ? 'default' : 'outline'}
                  onClick={() => setUnit('kg')}
                >
                  KG
                </Button>
                <Button
                  className='rounded-l-none'
                  variant={unit === 't' ? 'default' : 'outline'}
                  onClick={() => setUnit('t')}
                >
                  T
                </Button>
              </div>
            )}
            <Button
              onClick={() => saveAmount(newAmount)}
              icon={<Save />}
              disabled={
                notEnoughInventory ||
                notEnoughDestinationSpace ||
                newAmount === 0
              }
            >
              Save
            </Button>
          </div>
        </div>
        {newRemainingMass >= 0 && (
          <p className='text-sm'>
            {Format.productMass({
              product: product.i,
              amount: newRemainingMass,
            })}{' '}
            ({Format.volume(newRemainingVolume)}){' '}
            <span className='text-muted-foreground'>remaining</span>
          </p>
        )}
        {newRemainingMass < 0 && (
          <p className='text-sm text-destructive'>
            Only {Format.mass(totalMass)} available, please select a smaller
            amount.
          </p>
        )}
        {notEnoughDestinationSpace && (
          <p className='text-sm text-destructive'>
            Not enough space in destination
          </p>
        )}
        <div className='flex w-full items-center justify-between gap-x-3'>
          <Button
            variant='destructive'
            icon={<Trash />}
            onClick={() => saveAmount(0)}
            disabled={newAmount <= 0}
          >
            Discard all
          </Button>
          <Button
            icon={<Plus />}
            onClick={handleTakeAll}
            disabled={!canTakeAll}
          >
            Take all
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
