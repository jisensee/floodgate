import { Dispatch } from 'react'
import { InventoryCard } from './inventory-card'
import { Action } from './state'
import { Inventory } from '@/inventory-actions'
import {
  InventoryFilters,
  useInventoryFilters,
} from '@/components/inventory-filters'

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
  const { filteredInventories, filtersProps } = useInventoryFilters(inventories)
  return (
    <div className='flex flex-col gap-y-2'>
      <InventoryFilters {...filtersProps} />
      <div className='flex flex-col gap-y-1'>
        {filteredInventories.map((inventory) => (
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
    </div>
  )
}
