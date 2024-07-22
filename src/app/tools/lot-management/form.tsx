import { useState } from 'react'
import { Calendar as CalendarIcon, CircleAlert } from 'lucide-react'
import { isBefore } from 'date-fns/fp'
import { A, pipe } from '@mobily/ts-belt'
import { LotLease } from './actions'
import { LOT_SELECTION_LIMIT } from './util'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { useLotLeaseExtensions } from '@/hooks/contract'
import { SwayAmount } from '@/components/sway-amount'
import { InfoTooltip, StandardTooltip } from '@/components/ui/tooltip'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTransactionToast } from '@/hooks/transaction-toast'
import { cn } from '@/lib/utils'

export type FormProps = {
  endDate?: Date
  minEndDate?: Date
  onEndDateChange: (date?: Date) => void
  allLots: LotLease[]
  shownLots: number
  selectedLotIds: number[]
  selectedAsteroid: number
  onSelectedAsteroidChange: (asteroidId: number) => void
  onExtendSuccess: () => void
}

export const Form = ({
  endDate,
  minEndDate,
  onEndDateChange,
  allLots,
  shownLots,
  selectedLotIds,
  selectedAsteroid,
  onSelectedAsteroidChange,
  onExtendSuccess,
}: FormProps) => {
  const [calendarOpen, setCalendarOpen] = useState(false)
  const selectionLimitReached = selectedLotIds.length > LOT_SELECTION_LIMIT

  const { leaseExtensionPrice, floodgateFee, contractWriteResult } =
    useLotLeaseExtensions(
      endDate
        ? pipe(
            allLots,
            A.filter((lot) => selectedLotIds.includes(lot.lotId)),
            A.keepMap((lot) =>
              lot.addedDays && lot.addedDays > 0
                ? {
                    lotId: lot.lotId,
                    crewId: lot.agreement.permitted.id,
                    rate: BigInt(lot.agreement.rate),
                    recipient: lot.asteroidAdmin,
                    addedDays: lot.addedDays,
                  }
                : undefined
            )
          )
        : []
    )

  const { isLoading: isExtending } = useTransactionToast({
    txHash: contractWriteResult.data?.transaction_hash,
    submitStatus: contractWriteResult.status,
    submitError: contractWriteResult.error,
    pendingMessage: 'Extending leases...',
    successMessage: 'Leases extended successfully.',
    onSuccess: onExtendSuccess,
  })

  const datePicker = (
    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          className='group flex w-80 items-center justify-between'
        >
          <span className='text-muted-foreground group-hover:text-primary-foreground'>
            {endDate?.toLocaleDateString() ?? 'Select new end date'}
          </span>
          <CalendarIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Calendar
          mode='single'
          selected={endDate}
          onSelect={(newDate) => {
            setCalendarOpen(false)
            onEndDateChange(newDate)
          }}
          disabled={isBefore(minEndDate ?? new Date())}
        />
      </PopoverContent>
    </Popover>
  )

  const extendActive = selectedLotIds.length > 0 && endDate
  const feeInfoTooltip = (
    <InfoTooltip side='bottom'>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell className='font-medium text-muted-foreground'>
              Lease extensions
            </TableCell>
            <TableCell>
              <SwayAmount amount={leaseExtensionPrice} convert />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className='font-medium text-muted-foreground'>
              Floodgate fee
            </TableCell>
            <TableCell>
              <SwayAmount amount={floodgateFee} convert />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className='font-medium text-muted-foreground'>
              Total
            </TableCell>
            <TableCell>
              <SwayAmount
                amount={BigInt(floodgateFee) + leaseExtensionPrice}
                convert
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </InfoTooltip>
  )

  const extendButton = (
    <Button
      className='w-full'
      variant='accent'
      disabled={!extendActive || selectionLimitReached}
      loading={isExtending}
      onClick={() => contractWriteResult.send()}
    >
      {`Extend ${extendActive ? selectedLotIds.length + ' ' : ''}leases${extendActive ? ' for' : ''}`}
      {extendActive && (
        <SwayAmount
          className='ml-2'
          amount={leaseExtensionPrice + BigInt(floodgateFee)}
          convert
        />
      )}
    </Button>
  )

  const asteroidDropdown = (
    <Select
      value={selectedAsteroid.toString()}
      onValueChange={(v) => onSelectedAsteroidChange(parseInt(v))}
    >
      <SelectTrigger>
        <SelectValue placeholder='All asteroids' />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='0'>All asteroids</SelectItem>
        {pipe(
          allLots,
          A.uniqBy((lot) => lot.asteroidId),
          A.map((lot) => (
            <SelectItem key={lot.asteroidId} value={lot.asteroidId.toString()}>
              {lot.asteroidName}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  )

  return (
    <div className='flex flex-col gap-y-2'>
      <div className='flex items-center gap-x-5'>
        {datePicker}
        {asteroidDropdown}
      </div>
      <div className='flex items-center gap-x-5 px-1'>
        <div
          className={cn('flex min-w-44 items-center gap-x-2', {
            'text-destructive': selectionLimitReached,
          })}
        >
          <p>
            <span className='font-bold'>Selected:</span> {selectedLotIds.length}{' '}
            / {shownLots}
          </p>
          {selectionLimitReached && (
            <StandardTooltip
              content={`You can only extend ${LOT_SELECTION_LIMIT} leases at once. Please deselect some.`}
            >
              <CircleAlert />
            </StandardTooltip>
          )}
        </div>
        {extendButton}
        {feeInfoTooltip}
      </div>
    </div>
  )
}
