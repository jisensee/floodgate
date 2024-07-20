'use client'

import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { RowSelectionState } from '@tanstack/react-table'
import { A, D, O, pipe } from '@mobily/ts-belt'
import { addDays } from 'date-fns/fp'
import { LotLease, getLots } from './actions'
import { LotTable } from './lot-table'
import { Form } from './form'
import { getAddedDays, isLotLeaseValid } from './util'
import { Page } from '@/components/page'
import { RequireConnectedAccount } from '@/components/require-connected-account'

export default function LotManagementPage() {
  return (
    <Page title='Lot Management' fullSize>
      <RequireConnectedAccount>
        {(address) => <LotManagement address={address} />}
      </RequireConnectedAccount>
    </Page>
  )
}

const updateLotState = (lot: LotLease, endDate?: Date): LotLease => ({
  ...lot,
  addedDays: getAddedDays(lot, endDate),
})

const LotManagement = ({ address }: { address: string }) => {
  const [selectedAsteroid, setSelectedAsteroid] = useState(0)
  const [endDate, setEndDate] = useState<Date>()

  const {
    data: allLots,
    isLoading,
    refetch,
  } = useQuery({
    queryFn: () => getLots(address),
    queryKey: ['lots', address],
  })
  const [selectedLots, setSelectedLots] = useState<RowSelectionState>({})

  const filteredLots = useMemo(
    () =>
      pipe(
        allLots ?? [],
        A.filter(
          (lot) => selectedAsteroid === 0 || lot.asteroidId === selectedAsteroid
        ),
        A.map((l) => updateLotState(l, endDate))
      ),
    [allLots, selectedAsteroid, endDate]
  )

  const minEndDate = useMemo(
    () =>
      pipe(
        filteredLots,
        A.sortBy((lot) => lot.agreement.endTime),
        A.head,
        O.map((lot) => lot.agreement.endTimestamp),
        O.map(addDays(1))
      ),
    [filteredLots]
  )

  const selectedLotIds = useMemo(
    () =>
      pipe(
        selectedLots,
        D.filterWithKey((_, selected) => selected),
        D.keys,
        A.map(Number)
      ),
    [selectedLots]
  )

  const handleEndDateChange = (date?: Date) => {
    // Unselect lots which would now be before the selected end date
    pipe(
      selectedLots,
      D.mapWithKey((lotId, selected) => {
        if (!selected) return false
        const lot = allLots?.find((lot) => lot.lotId.toString() === lotId)
        return !!lot && isLotLeaseValid(lot, date)
      }),
      setSelectedLots
    )
    setEndDate(date)
  }

  return (
    <div className='flex flex-col gap-y-2'>
      <Form
        endDate={endDate}
        minEndDate={minEndDate ?? undefined}
        onEndDateChange={handleEndDateChange}
        allLots={allLots?.map((l) => updateLotState(l, endDate)) ?? []}
        shownLots={filteredLots.length}
        selectedLotIds={selectedLotIds}
        selectedAsteroid={selectedAsteroid}
        onSelectedAsteroidChange={(asteroidId) => {
          setSelectedAsteroid(asteroidId)
          setSelectedLots({})
        }}
        onExtendSuccess={() => {
          setEndDate(undefined)
          setSelectedLots({})
          refetch()
        }}
      />
      <LotTable
        lots={filteredLots}
        selectedLots={selectedLots}
        onSelectedLotsChange={setSelectedLots}
        isLoading={isLoading}
      />
    </div>
  )
}
