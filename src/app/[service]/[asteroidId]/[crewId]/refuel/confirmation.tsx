import { FC, useState } from 'react'
import { Fuel, MoveDown } from 'lucide-react'
import { Asteroid } from '@influenceth/sdk'
import { useWizard } from 'react-use-wizard'
import { ShipImage, WarehouseImage } from '@/components/asset-images'
import { Progress } from '@/components/ui/progress'
import { SwayAmount } from '@/components/sway-amount'
import { Format, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useDevteamShare, useFuelShipTransaction } from '@/hooks/contract'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Ship, Warehouse } from '@/actions'
import { FloodgateCrew } from '@/lib/contract-types'
import { useTransactionToast } from '@/hooks/transaction-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { InfoTooltip } from '@/components/ui/tooltip'

export type ConfirmationProps = {
  crew: FloodgateCrew
  actionFee: bigint
  selectedShip: Ship
  selectedWarehouse: Warehouse
  onReset: () => void
}

export const Confirmation: FC<ConfirmationProps> = ({
  crew,
  actionFee,
  selectedShip,
  selectedWarehouse,
  onReset,
}) => {
  const transportBonus = crew.bonuses.transportTime.totalBonus
  const { goToStep } = useWizard()
  const devteamShare = useDevteamShare()

  const overfuelBonus = crew.bonuses.volumeCapacity.totalBonus
  const missingFuel =
    selectedShip.fuelCapacity * overfuelBonus - selectedShip.fuelAmount
  const maxFuel = Math.min(missingFuel, selectedWarehouse.fuelAmount)
  const [usedFuel, setUsedFuel] = useState(maxFuel)
  const newFuelAmount = selectedShip.fuelAmount + usedFuel
  const newFuelPercentage = (newFuelAmount / selectedShip.fuelCapacity) * 100
  const distance = Asteroid.getLotDistance(
    1,
    selectedWarehouse.lotIndex,
    selectedShip.lotIndex
  )
  const transferSeconds =
    Asteroid.getLotTravelTime(
      1,
      selectedWarehouse.lotIndex,
      selectedShip.lotIndex,
      transportBonus
    ) / 24

  const {
    write: fuelShip,
    data,
    status: submitStatus,
    error: submitError,
  } = useFuelShipTransaction({
    warehouseId: selectedWarehouse.id,
    shipId: selectedShip.id,
    contractCrewId: crew.id,
    warehouseOwnerCrewId: selectedWarehouse.owningCrewId,
    shipOwnerCrewId: selectedShip.owningCrewId,
    fuelAmount: usedFuel - 1,
    swayFee: actionFee,
  })

  const { isLoading, status: txStatus } = useTransactionToast({
    txHash: data?.transaction_hash,
    submitStatus,
    submitError,
    pendingMessage: 'Fueling ship...',
  })

  const fuelSuccess = txStatus === 'success'

  return (
    <div className='flex flex-col items-center gap-y-3'>
      <div className='flex flex-col items-center'>
        <div className='flex flex-col items-center gap-y-1 pb-3'>
          <p>{selectedWarehouse.name}</p>
          <WarehouseImage size={150} />
        </div>
        <MoveDown size={32} />
        <div className='flex flex-col items-center gap-y-1 pb-3'>
          <ShipImage type={selectedShip.type} size={150} />
          <p>{selectedShip.name}</p>
          {!fuelSuccess && (
            <Progress
              className='h-2'
              indicatorClassName={newFuelPercentage >= 100 ? 'bg-success' : ''}
              value={Math.min(100, newFuelPercentage)}
            />
          )}
          <p
            className={cn('text-sm text-muted-foreground', {
              'mt-3 text-2xl text-success': fuelSuccess,
            })}
          >
            {fuelSuccess ? 'Fueled' : 'Fueling'} up to{' '}
            {Math.round(newFuelPercentage)}% ({Format.mass(newFuelAmount)})
          </p>
        </div>
      </div>
      {!fuelSuccess && (
        <>
          <div className='flex w-2/3 flex-col items-center gap-y-2'>
            <Label className='text-muted-foreground'>
              Customize fuel amount
            </Label>
            <Slider
              className='w-full'
              value={[usedFuel]}
              onValueChange={([value]) => value && setUsedFuel(value)}
              min={1}
              max={maxFuel}
            />
            <p className='text-muted-foreground'>
              Transferring{' '}
              <span className='text-foreground'>{Format.mass(usedFuel)}</span>{' '}
              of fuel to your ship.
            </p>
          </div>
          <div className='flex flex-col items-center gap-y-3 text-muted-foreground'>
            <p>
              Transport over{' '}
              <span className='text-foreground'>
                {Format.distance(distance)}
              </span>{' '}
              {transferSeconds === 0 ? (
                <>
                  will be <span className='text-success'>instant.</span>
                </>
              ) : (
                <>
                  will take{' '}
                  <span className='text-foreground'>
                    {Format.duration(transferSeconds)}
                  </span>
                </>
              )}
            </p>
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
          </div>
          <Button
            className='mt-3 h-14'
            variant='accent'
            onClick={() => fuelShip()}
            icon={<Fuel size={24} />}
            loading={isLoading}
          >
            Fuel Ship
          </Button>
        </>
      )}
      {fuelSuccess && (
        <Button
          size='lg'
          icon={<Fuel size={24} />}
          onClick={() => {
            onReset()
            goToStep(0)
          }}
        >
          Fuel another ship
        </Button>
      )}
    </div>
  )
}

const FeeBreakdown = ({
  devteamShare,
  actionFee,
}: {
  devteamShare: number
  actionFee: bigint
}) => {
  const managerShare = 1 - devteamShare
  const devteamAmount = Math.floor(Number(actionFee) * devteamShare)
  const managerAmount = Math.floor(Number(actionFee) * managerShare)

  return (
    <div>
      <p className='text-muted-foreground'>
        The fee you pay is split the following way:
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead />
            <TableHead>Share</TableHead>
            <TableHead>Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className='font-medium text-muted-foreground'>
              Dev team
            </TableCell>
            <TableCell>{devteamShare * 100}%</TableCell>
            <TableCell>
              <SwayAmount amount={devteamAmount} convert />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className='font-medium text-muted-foreground'>
              Crew manager
            </TableCell>
            <TableCell>{managerShare * 100}%</TableCell>
            <TableCell>
              <SwayAmount amount={managerAmount} convert />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className='font-medium text-muted-foreground'>
              Total
            </TableCell>
            <TableCell>100%</TableCell>
            <TableCell>
              <SwayAmount amount={actionFee} convert />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
