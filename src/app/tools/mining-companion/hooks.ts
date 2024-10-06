import { Entity, System } from '@influenceth/sdk'
import { useSendTransaction } from '@starknet-react/core'
import { A, D, pipe } from '@mobily/ts-belt'
import { atomWithStorage } from 'jotai/utils'
import { useAtom } from 'jotai'
import { PendingSample } from './state'
import {
  getGenericFeeCalls,
  influenceDispatcherContract,
} from '@/lib/contracts'
import { useIsDevTeam } from '@/hooks/contract'

export const useStartSamplesCall = (samples: PendingSample[]) => {
  const isDevTeam = useIsDevTeam()
  const { fee, calls: feeCalls } = getGenericFeeCalls(
    200,
    samples.length,
    isDevTeam
  )

  const sendResult = useSendTransaction({
    calls: [
      ...feeCalls,
      ...pipe(
        samples,
        A.map((s) => s.crewId),
        A.uniq,
        A.map((id) =>
          System.getRunSystemCall(
            'ResolveRandomEvent',
            {
              choice: 0,
              caller_crew: {
                id,
                label: Entity.IDS.CREW,
              },
            },
            influenceDispatcherContract.address
          )
        )
      ),
      ...samples.map((sample) =>
        System.getRunSystemCall(
          'SampleDepositStart',
          {
            lot: {
              id: sample.lotId,
              label: Entity.IDS.LOT,
            },
            resource: sample.resource,
            origin: {
              id: sample.origin.id,
              label: sample.origin.label,
            },
            origin_slot: sample.origin.slot,
            caller_crew: {
              id: sample.crewId,
              label: Entity.IDS.CREW,
            },
          },
          influenceDispatcherContract.address
        )
      ),
    ],
  })

  return { sendResult, fee }
}

const sampleCrews = atomWithStorage<Record<number, number>>(
  'miningCompanionSampleCrews',
  {}
)
const coreDrillInventories = atomWithStorage<Record<number, number>>(
  'miningCompanionCoreDrillWarehouses',
  {}
)

const sampleResources = atomWithStorage<Record<number, number>>(
  'miningCompanionSampleResources',
  {}
)

export const useSampleCrew = (lotId: number, defaultCrewId?: number) => {
  const [crews, setCrews] = useAtom(sampleCrews)

  return {
    crewId: crews[lotId] || defaultCrewId,
    setCrewId: (crewId: number) => setCrews(D.set(lotId, crewId)),
  }
}

export const useCoreDrillInventory = (
  lotId: number,
  defaultInventoryId?: number
) => {
  const [inventories, setInventories] = useAtom(coreDrillInventories)

  return {
    inventoryId: inventories[lotId] ?? defaultInventoryId,
    setInventoryId: (inventoryId: number) =>
      setInventories(D.set(lotId, inventoryId)),
  }
}

export const useSampleResource = (lotId: number, defaultResource?: number) => {
  const [resources, setResources] = useAtom(sampleResources)

  return {
    resource: resources[lotId] ?? defaultResource,
    setResource: (resource: number) => setResources(D.set(lotId, resource)),
  }
}
