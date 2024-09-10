import { ArrowDownWideNarrow, ArrowUpWideNarrow } from 'lucide-react'
import { ReactNode } from 'react'
import { Button } from './ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'

export type Sorting<T> = {
  sortBy: T
  sortDirection: 'asc' | 'desc'
}
export type SortDropdownProps<T extends string> = {
  options: { value: T; label: ReactNode }[]
  sorting: Sorting<T>
  onSortingChange: (sorting: Sorting<T>) => void
  dropdownClassName?: string
}

export const SortDropdown = <T extends string>({
  options,
  sorting,
  onSortingChange,
  dropdownClassName,
}: SortDropdownProps<T>) => {
  const direction = (
    <Button
      variant='ghost'
      size='icon'
      onClick={() =>
        onSortingChange({
          ...sorting,
          sortDirection: sorting.sortDirection === 'asc' ? 'desc' : 'asc',
        })
      }
    >
      {sorting.sortDirection === 'asc' ? (
        <ArrowUpWideNarrow />
      ) : (
        <ArrowDownWideNarrow />
      )}
    </Button>
  )

  const select = (
    <Select
      value={sorting.sortBy}
      onValueChange={(value) =>
        onSortingChange({ ...sorting, sortBy: value as T })
      }
    >
      <SelectTrigger className={dropdownClassName}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )

  return (
    <div className='flex items-center gap-x-1'>
      {direction}
      {select}
    </div>
  )
}
