import { Dispatch } from 'react'
import { InventoryCard } from './inventory-card'
import { Action } from './state'
import { Inventory } from '@/inventory-actions'

export type SelectDestinationStepProps = {
  inventories: Inventory[]
  destination?: Inventory
  dispatch: Dispatch<Action>
}

export const SelectDestinationStep = ({
  inventories,
  destination,
  dispatch,
}: SelectDestinationStepProps) => {
  return (
    <div className='flex flex-col gap-y-1'>
      {inventories.map((inventory) => (
        <InventoryCard
          key={inventory.inventoryUuid}
          inventory={inventory}
          selected={destination?.inventoryUuid === inventory.inventoryUuid}
          onSelect={() =>
            dispatch({
              type: 'select-destination',
              destination: inventory,
            })
          }
        />
      ))}
    </div>
  )
}
