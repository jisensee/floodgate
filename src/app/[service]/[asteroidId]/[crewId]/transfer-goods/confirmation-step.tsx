import { Asteroid, Entity, Product } from '@influenceth/sdk'
import { ProductAmount } from 'influence-typed-sdk/api'
import { Truck } from 'lucide-react'
import { useWizard } from 'react-use-wizard'
import { A, D, pipe } from '@mobily/ts-belt'
import { useQuery } from '@tanstack/react-query'
import { type Inventory } from './actions'
import { Delivery, getDeliveriesContents } from './state'
import { useDevteamShare, useTransferGoodsTransaction } from '@/hooks/contract'
import { Button } from '@/components/ui/button'
import { FloodgateCrew } from '@/lib/contract-types'
import { useTransactionToast } from '@/hooks/transaction-toast'
import { Format, calcMassAndVolume, pluralize } from '@/lib/utils'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProductImage } from '@/components/asset-images'
import { SwayAmount } from '@/components/sway-amount'
import { InfoTooltip } from '@/components/ui/tooltip'
import { FeeBreakdown } from '@/components/fee-breakdown'
import { Separator } from '@/components/ui/separator'
import { getAutomaticFeedingAmount } from '@/actions'

export type ConfirmationStepProps = {
  crew: FloodgateCrew
  inventories: Inventory[]
  destination: Inventory
  deliveries: Delivery[]
  onReset: () => void
}

export const ConfirmationStep = ({
  crew,
  destination,
  deliveries,
  onReset,
}: ConfirmationStepProps) => {
  const { goToStep } = useWizard()

  const actionFee =
    crew.services.find((s) => s.serviceType === 'TransferGoods')
      ?.actionSwayFee ?? 0n

  const devteamShare = useDevteamShare()

  const { data: feedingAmount } = useQuery({
    queryKey: ['feedingAmount', crew.id],
    queryFn: () => getAutomaticFeedingAmount(crew),
  })

  const getDeliveryDistance = (delivery: Delivery) => {
    const distance = Asteroid.getLotDistance(
      crew.asteroidId,
      delivery.source.lotIndex,
      destination.lotIndex
    )
    const travelTime =
      Asteroid.getLotTravelTime(
        crew.asteroidId,
        delivery.source.lotIndex,
        destination.lotIndex,
        crew.bonuses.transportTime.totalBonus
      ) / 24
    return { distance, travelTime }
  }

  const {
    write: transferGoods,
    data,
    status,
    error,
  } = useTransferGoodsTransaction(
    crew.id,
    actionFee,
    {
      owningCrewId: destination.owningCrewId,
      inventoryId: destination.id,
      inventoryType:
        destination.type === 'ship' ? Entity.IDS.SHIP : Entity.IDS.BUILDING,
      inventorySlot: 2,
    },
    deliveries.map((delivery) => ({
      source: {
        inventoryId: delivery.source.id,
        inventoryType:
          delivery.source.type === 'ship'
            ? Entity.IDS.SHIP
            : Entity.IDS.BUILDING,
        inventorySlot: 2,
        owningCrewId: delivery.source.owningCrewId,
      },
      contents: delivery.contents.filter((c) => c.amount > 0),
    })),
    feedingAmount ?? 0
  )
  const { status: deliveryStatus, isLoading } = useTransactionToast({
    txHash: data?.transaction_hash,
    submitStatus: status,
    submitError: error,
    pendingMessage: 'Transferring goods...',
  })
  const deliverySuccess = deliveryStatus === 'success'

  const actualDeliveries = deliveries.filter(
    (d) => d.contents.filter((c) => c.amount > 0).length > 0
  )

  const longestDelivery = pipe(
    actualDeliveries,
    A.map(getDeliveryDistance),
    A.sortBy(D.prop('travelTime')),
    A.last
  )

  return (
    <div className='flex flex-col items-center gap-y-3'>
      <p className='text-2xl'>
        {deliverySuccess ? 'Sent' : 'Sending'} {actualDeliveries.length}{' '}
        {pluralize(actualDeliveries.length, 'delivery', 'deliveries')} to{' '}
        {destination.name}
      </p>
      {deliverySuccess ? (
        <Button
          size='lg'
          icon={<Truck size={24} />}
          onClick={() => {
            onReset()
            goToStep(0)
          }}
        >
          Transfer more goods
        </Button>
      ) : (
        <>
          {longestDelivery && (
            <p>
              Longest delivery takes{' '}
              <span className='font-bold'>
                {Format.duration(longestDelivery.travelTime)}
              </span>
            </p>
          )}
          <div className='flex items-center gap-x-2'>
            You will pay a fee of{' '}
            <SwayAmount
              className='text-destructive'
              amount={Number(actionFee)}
              convert
            />
            {devteamShare && (
              <InfoTooltip>
                <FeeBreakdown
                  devteamShare={devteamShare}
                  actionFee={actionFee}
                />
              </InfoTooltip>
            )}
          </div>
          <Button
            variant='accent'
            onClick={() => transferGoods()}
            icon={<Truck />}
            loading={isLoading}
          >
            Send {pluralize(actualDeliveries.length, 'delivery', 'deliveries')}
          </Button>
        </>
      )}
      <Separator className='mt-2' />
      <p className='text-2xl'>Summary</p>
      <Tabs className='w-full' defaultValue='by-delivery'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='by-delivery'>By delivery</TabsTrigger>
          <TabsTrigger value='all'>All deliveries</TabsTrigger>
        </TabsList>
        <TabsContent value='by-delivery'>
          <Accordion type='multiple' className='w-full'>
            {actualDeliveries.map((delivery) => {
              const selectedItems = delivery.contents.filter(
                (c) => c.amount > 0
              ).length
              const { travelTime, distance } = getDeliveryDistance(delivery)

              return (
                <AccordionItem
                  key={delivery.source.uuid}
                  value={delivery.source.uuid}
                >
                  <AccordionTrigger>
                    {delivery.source.name}, {selectedItems}{' '}
                    {pluralize(selectedItems, 'item')}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p>
                      Transport over{' '}
                      <span className='font-bold'>
                        {Format.distance(distance)}
                      </span>{' '}
                      will take{' '}
                      <span className='font-bold'>
                        {Format.duration(travelTime)}
                      </span>
                    </p>
                    <ProductTable productAmounts={delivery.contents} />
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </TabsContent>
        <TabsContent value='all'>
          <ProductTable
            productAmounts={getDeliveriesContents(actualDeliveries)}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

type ProductTableProps = {
  productAmounts: ProductAmount[]
}

const ProductTable = ({ productAmounts }: ProductTableProps) => {
  const { mass, volume } = calcMassAndVolume(productAmounts)
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Mass</TableHead>
          <TableHead>Volume</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {productAmounts
          .filter(({ amount }) => amount > 0)
          .map(({ product, amount }) => (
            <TableRow key={product}>
              <TableCell className='flex items-center gap-x-2'>
                <ProductImage width={25} productId={product} />
                <span>{Product.getType(product).name}</span>
              </TableCell>
              <TableCell>{Format.productMass({ product, amount })}</TableCell>
              <TableCell>
                {Format.volume(calcMassAndVolume([{ product, amount }]).volume)}
              </TableCell>
            </TableRow>
          ))}
        <TableRow className='font-bold'>
          <TableCell>Total</TableCell>
          <TableCell>{Format.mass(mass)}</TableCell>
          <TableCell>{Format.volume(volume)}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}
