import { FC } from 'react'
import { Fuel, MoveDown } from 'lucide-react'
import { Asteroid } from '@influenceth/sdk'
import { StepProps } from './state'
import { ShipImage, WarehouseImage } from '@/components/asset-images'
import { Progress } from '@/components/ui/progress'
import { SwayAmount } from '@/components/sway-amount'
import { Format } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export const Confirmation: FC<StepProps> = ({ state }) => {
  const ship = state.selectedShip
  const warehouse = state.selectedWarehouse
  if (!ship || !warehouse) {
    return null
  }
  const overfuelBonus = 0.05
  const missingFuel = ship.fuelCapacity * (1 + overfuelBonus) - ship.fuelAmount
  const usedFuel = Math.min(missingFuel, warehouse.fuelAmount)
  const newFuelAmount = ship.fuelAmount + usedFuel
  const newFuelPercentage = (newFuelAmount / ship.fuelCapacity) * 100
  const distance = Asteroid.getLotDistance(1, warehouse.lotIndex, ship.lotIndex)
  const transferSeconds =
    Asteroid.getLotTravelTime(1, warehouse.lotIndex, ship.lotIndex) / 24

  return (
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
          will take{' '}
          <span className='text-foreground'>
            {Format.duration(transferSeconds)}
          </span>
        </p>
        <div className='flex items-center gap-x-2'>
          You will pay a fee of{' '}
          <SwayAmount className='text-foreground' amount={3000} />
        </div>
      </div>
      <Button className='mt-3 h-14 gap-x-2'>
        <Fuel size={24} />
        Fuel Ship
      </Button>
    </div>
  )
}
