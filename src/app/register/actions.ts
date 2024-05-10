'use server'

import { Address, Entity } from '@influenceth/sdk'
import { A, F, G, pipe } from '@mobily/ts-belt'
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
  const asteroidNames = await influenceApi.util.asteroidNames(
    pipe(
      crews,
      A.map((c) => c.Location?.locations?.asteroid?.id),
      A.filter(G.isNotNullable),
      F.toMutable
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
