import { differenceInDays, endOfDay } from 'date-fns'
import { O, pipe } from '@mobily/ts-belt'
import { LotLease } from './actions'

export const getAddedDays = (lotLease: LotLease, selectedEndDate?: Date) =>
  selectedEndDate
    ? differenceInDays(
        endOfDay(selectedEndDate),
        endOfDay(lotLease.agreement.endTimestamp)
      )
    : undefined

export const isLotLeaseValid = (lotLease: LotLease, selectedEndDate?: Date) =>
  pipe(
    selectedEndDate,
    O.mapNullable((end) => getAddedDays(lotLease, end)),
    O.map((addedDays) => addedDays > 0)
  ) ?? true

export const LOT_SELECTION_LIMIT = 150
