import { Dispatch } from 'react'
import { type Inventory } from './actions'
import { InventoryCard } from './inventory-card'
import { Action } from './state'

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
          key={inventory.id}
          inventory={inventory}
          selected={destination?.uuid === inventory.uuid}
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
