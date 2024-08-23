import { useState } from 'react'
import { Fuel, Slash } from 'lucide-react'
import { Inventory } from '@/inventory-actions'
import { Input } from '@/components/ui/input'
import { StandardTooltip } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'

export type InventoryFilters = {
  name?: string
  showPropBays?: boolean
}

const matchesFilters = (inventory: Inventory, filters: InventoryFilters) => {
  if (
    filters.name &&
    !inventory.entity.name.toLowerCase().includes(filters.name.toLowerCase())
  ) {
    return false
  }
  if (!filters.showPropBays && inventory.isPropellantBay) {
    return false
  }
  return true
}

export const useInventoryFilters = (inventories: Inventory[]) => {
  const [filters, setFilters] = useState<InventoryFilters>({})

  const filteredInventories = inventories.filter((i) =>
    matchesFilters(i, filters)
  )

  return {
    filteredInventories,
    filtersProps: {
      filters,
      onFiltersChange: setFilters,
      showPropBayFilter: inventories.some((i) => i.isPropellantBay),
    },
  }
}

export type InventoryFiltersProps = {
  filters: InventoryFilters
  onFiltersChange: (filters: InventoryFilters) => void
  showPropBayFilter?: boolean
}

export const InventoryFilters = ({
  filters,
  onFiltersChange,
  showPropBayFilter,
}: InventoryFiltersProps) => (
  <div className='flex gap-x-2'>
    <Input
      value={filters.name}
      onChange={(e) => onFiltersChange({ ...filters, name: e.target.value })}
      placeholder='Filter by name'
    />
    {showPropBayFilter && (
      <StandardTooltip
        content={`${filters.showPropBays ? 'Hide' : 'Show'} Propellant Bays`}
      >
        <Button
          variant='ghost'
          icon={
            <div className='relative h-full w-6'>
              <Fuel className='absolute left-0 top-0' />
              {filters.showPropBays && (
                <Slash className='absolute left-0 top-0' />
              )}
            </div>
          }
          onClick={() =>
            onFiltersChange({ ...filters, showPropBays: !filters.showPropBays })
          }
        />
      </StandardTooltip>
    )}
  </div>
)
