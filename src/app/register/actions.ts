'use server'

import { Address, Entity } from '@influenceth/sdk'
import * as R from 'remeda'
import { influenceApi } from '@/lib/influence-api'

export const getAccountCrews = async (address: string) => {
  console.log('getting account crews', address)
  const crews = await influenceApi.entities({
    match: {
      path: 'Nft.owners.starknet',
      value: Address.toStandard(address),
    },
    label: Entity.IDS.CREW,
  })

  console.log('getting asteroid names')
  const asteroidNames = await influenceApi.util.asteroidNames(
    R.pipe(
      crews,
      R.map((c) => c.Location?.locations?.asteroid?.id),
      R.filter(R.isTruthy)
    )
  )

  return crews.map((crew) => ({
    ...crew,
    asteroidId: crew.Location?.locations?.asteroid?.id ?? 0,
    asteroidName: asteroidNames.get(
      crew.Location?.locations?.asteroid?.id ?? 0
    ),
  }))
}
