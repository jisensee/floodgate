import {
  ColumnDef,
  RowSelectionState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { addDays, differenceInDays } from 'date-fns'
import { Dispatch, SetStateAction, useState } from 'react'
import { ArrowDown, ArrowUp, CircleAlert } from 'lucide-react'
import { A, O } from '@mobily/ts-belt'
import { LotLease } from './actions'
import { Format, cn } from '@/lib/utils'
import { SwayAmount } from '@/components/sway-amount'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { InfoTooltip, StandardTooltip } from '@/components/ui/tooltip'

export type LotTableProps = {
  lots: LotLease[]
  selectedLots: RowSelectionState
  onSelectedLotsChange: Dispatch<SetStateAction<RowSelectionState>>
  isLoading?: boolean
}

export const LotTable = ({
  lots,
  selectedLots,
  onSelectedLotsChange,
  isLoading,
}: LotTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'endDate',
      desc: false,
    },
  ])
  const table = useReactTable({
    data: lots,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: onSelectedLotsChange,
    enableRowSelection: (row) =>
      O.mapWithDefault(
        row.original.addedDays,
        true,
        (addedDays) => addedDays > 0
      ),
    getRowId: (row) => row.lotId.toString(),
    state: {
      sorting,
      rowSelection: selectedLots,
    },
  })

  return (
    <div className='oveflow-x-auto rounded-md border'>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    <div
                      className={cn('flex flex-row items-center gap-x-2', {
                        'cursor-pointer': header.column.getCanSort(),
                      })}
                      onClick={() =>
                        header.column.getCanSort() &&
                        header.column.toggleSorting()
                      }
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {header.column.getIsSorted() === 'asc' && <ArrowUp />}
                      {header.column.getIsSorted() === 'desc' && <ArrowDown />}
                    </div>
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            A.makeWithIndex(10, (row) => (
              <TableRow key={row}>
                {columns.map((_, col) => (
                  <TableCell key={col}>
                    <Skeleton
                      className={cn('h-8', {
                        'w-8': col === 0,
                        'w-24': col !== 0,
                      })}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className='h-24 text-center'>
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

const columns: ColumnDef<LotLease>[] = [
  {
    id: 'selection',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
      />
    ),
    cell: ({ row }) => (
      <div className='flex items-center gap-x-3'>
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          disabled={!row.getCanSelect()}
          aria-label='Select row'
        />
        {row.original.addedDays !== undefined &&
          row.original.addedDays <= 0 && (
            <StandardTooltip
              content={
                <div className='max-w-64'>
                  Your selected new end date is {-row.original.addedDays} days
                  before this lease would end. Select an end date after{' '}
                  {addDays(
                    row.original.agreement.endTimestamp,
                    -row.original.addedDays
                  ).toLocaleDateString()}{' '}
                  to be able to select this lease.
                </div>
              }
            >
              <CircleAlert className='text-warning' size={20} />
            </StandardTooltip>
          )}
      </div>
    ),
    enableSorting: false,
  },
  {
    id: 'index',
    header: 'Lot Index',
    accessorFn: (row) => row.lotIndex,
    enableSorting: true,
    cell: (p) => Format.lotIndex(p.row.original.lotIndex),
  },
  {
    id: 'asteroidName',
    header: 'Asteroid',
    accessorFn: (row) => row.asteroidName,
    enableSorting: true,
  },
  {
    id: 'building',
    header: 'Building',
    accessorFn: (row) => row.buildingName,
    enableSorting: true,
  },
  {
    id: 'rate',
    header: 'SWAY/Day',
    accessorFn: (row) => row.agreement.rate,
    enableSorting: true,
    cell: (p) => <SwayAmount amount={p.row.original.agreement.rate} convert />,
  },
  {
    id: 'endDate',
    header: 'Expires in',
    accessorFn: (row) => row.agreement.endTimestamp,
    enableSorting: true,
    cell: (p) => (
      <div className='flex items-center gap-x-2'>
        <span>
          {differenceInDays(p.row.original.agreement.endTimestamp, new Date())}{' '}
          days
        </span>
        <InfoTooltip size={20}>
          {p.row.original.agreement.endTimestamp.toLocaleString()}
        </InfoTooltip>
      </div>
    ),
  },
  {
    id: 'added-time',
    header: 'Added time',
    accessorFn: (row) => row.addedDays,
    enableSorting: true,
    cell: ({ row: { original, getIsSelected } }) => (
      <div className='flex min-w-44 items-center gap-x-2'>
        {getIsSelected() &&
          original.addedDays !== undefined &&
          original.addedDays > 0 && (
            <>
              <span>{original.addedDays} days</span>
              <SwayAmount
                className='text-destructive'
                amount={original.addedDays * original.agreement.rate}
                convert
              />
            </>
          )}
      </div>
    ),
  },
]
