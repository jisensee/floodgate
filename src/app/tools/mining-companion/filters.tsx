import { Filters } from './state'
import { AsteroidSelect } from '@/components/asteroid-select'
import { SortDropdown } from '@/components/sort-dropdown'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export type FilterRowProps = {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  asteroidNames: Map<number, string>
}

export const FilterRow = ({
  filters,
  onFiltersChange,
  asteroidNames,
}: FilterRowProps) => {
  const asteroidFilter = (
    <div className='grow'>
      <Label>Asteroid</Label>
      <AsteroidSelect
        asteroidNames={asteroidNames}
        asteroidId={filters.asteroidId}
        onAsteroidIdChange={(value) =>
          onFiltersChange({ ...filters, asteroidId: value })
        }
        allowAll
      />
    </div>
  )
  const searchFilter = (
    <div className='w-64'>
      <Label>Extractor Name</Label>
      <Input
        value={filters.search}
        onChange={(e) =>
          onFiltersChange({ ...filters, search: e.target.value })
        }
        placeholder='Search for an extractor name'
        onClear={() => onFiltersChange({ ...filters, search: '' })}
      />
    </div>
  )
  const sortDropdown = (
    <SortDropdown
      dropdownClassName='w-44'
      options={[
        {
          value: 'available-samples',
          label: 'Available Samples',
        },
        {
          value: 'extraction-time',
          label: 'Extraction Time',
        },
        {
          value: 'alphabetical',
          label: 'Extractor Name',
        },
        {
          value: 'asteroid',
          label: 'Asteroid ID',
        },
      ]}
      sorting={filters.sorting}
      onSortingChange={(newSorting) =>
        onFiltersChange({ ...filters, sorting: newSorting })
      }
    />
  )
  return (
    <div className='flex flex-wrap items-end gap-2'>
      {asteroidFilter}
      {searchFilter}
      {sortDropdown}
    </div>
  )
}
