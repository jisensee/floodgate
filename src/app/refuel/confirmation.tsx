import { FC } from 'react'
import { Fuel, MoveDown } from 'lucide-react'
import { Asteroid } from '@influenceth/sdk'
import { StepProps } from './state'
import { ShipImage, WarehouseImage } from '@/components/asset-images'
import { Progress } from '@/components/ui/progress'
import { SwayAmount } from '@/components/sway-amount'
import { Format } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useFuelShipTransaction, useSwayFee } from '@/hooks/contract'

export const Confirmation: FC<StepProps> = ({ state }) => {
  const transportBonus =
    state.crewData?.bonuses?.transportTimeBonus?.totalBonus ?? 1
  const ship = state.selectedShip!
  const warehouse = state.selectedWarehouse!

  const overfuelBonus = state.crewData?.bonuses.volumeBonus.totalBonus ?? 1
  const missingFuel = ship.fuelCapacity * overfuelBonus - ship.fuelAmount
  const usedFuel = Math.min(missingFuel, warehouse.fuelAmount) - 1
  const newFuelAmount = ship.fuelAmount + usedFuel
  const newFuelPercentage = (newFuelAmount / ship.fuelCapacity) * 100
  const distance = Asteroid.getLotDistance(1, warehouse.lotIndex, ship.lotIndex)
  const transferSeconds =
    Asteroid.getLotTravelTime(
      1,
      warehouse.lotIndex,
      ship.lotIndex,
      transportBonus
    ) / 24

  const swayFee = useSwayFee()

  const { write: fuelShip } = useFuelShipTransaction({
    warehouseId: warehouse?.id ?? 0,
    shipId: ship?.id ?? 0,
    contractCrewId: state.crewData?.crew?.id ?? 0,
    warehouseOwnerCrewId: warehouse?.owningCrewId ?? 0,
    shipOwnerCrewId: ship?.owningCrewId ?? 0,
    fuelAmount: usedFuel,
    swayFee: swayFee ?? 0n,
  })

  return ship && warehouse ? (
    <div className='flex flex-col items-center gap-y-3'>
      <div className='flex flex-col items-center'>
        <div className='flex flex-col items-center gap-y-1 pb-3'>
          <p>{warehouse.name}</p>
          <WarehouseImage size={150} />
        </div>
        <MoveDown size={32} />
        <div className='flex flex-col items-center gap-y-1 pb-3'>
          <ShipImage type={ship.type} size={150} />
          <p>{ship.name}</p>
          <Progress className='h-2' value={Math.min(100, newFuelPercentage)} />
          <p className='text-sm text-muted-foreground'>
            Fueling up to {Math.round(newFuelPercentage)}%
          </p>
        </div>
      </div>
      <div className='flex flex-col items-center gap-y-3 rounded-lg border border-primary p-3 text-muted-foreground'>
        <p>
          Transferring{' '}
          <span className='text-foreground'>{Format.mass(usedFuel)}</span> of
          fuel to your ship.
        </p>
        <p>
          Transport over{' '}
          <span className='text-foreground'>{Format.distance(distance)}</span>{' '}
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
        {!!swayFee && (
          <div className='flex items-center gap-x-2'>
            You will pay a fee of{' '}
            <SwayAmount
              className='text-destructive'
              amount={Number(swayFee / 1_000_000n)}
            />
          </div>
        )}
      </div>
      <Button className='mt-3 h-14 gap-x-2' onClick={() => fuelShip()}>
        <Fuel size={24} />
        Fuel Ship
      </Button>
    </div>
  ) : null
}
