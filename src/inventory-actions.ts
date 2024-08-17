'use server'

import { Entity, Inventory } from '@influenceth/sdk'
import { A } from '@mobily/ts-belt'
import { getEntityName } from 'influence-typed-sdk/api'
import { influenceApi } from '@/lib/influence-api'

export type Inventory = {
    entity: {
        label: number
        type: number
        id: number
        name: string
        lotIndex: number
        owningCrewId: number
    }
    status: number
    contents: {
        product: number
        amount: number
    }[]
    inventoryType: number
    isPropellantBay: boolean
    mass: number
    volume: number
    reservedMass: number
    reservedVolume: number
    slot: number
}

export const getInventories = async (
    ownerAddress: string,
    asteroidId: number
  ): Promise<Inventory[]> => {
    const [ships, warehouses] = await Promise.all([
      influenceApi.util.ships(ownerAddress, asteroidId),
      influenceApi.util.warehouses(ownerAddress, asteroidId),
    ])
    {
        const inventories: Inventory[] = []

        A.concat(ships, warehouses).forEach(entity => {
            entity.Inventories.forEach(i => {

                let isPropellantBay = false
                switch(i.inventoryType) {
                    case Inventory.IDS.PROPELLANT_LARGE:
                        isPropellantBay = true
                        break
                    case Inventory.IDS.PROPELLANT_MEDIUM:
                        isPropellantBay = true
                        break
                    case Inventory.IDS.PROPELLANT_SMALL:
                        isPropellantBay = true
                        break
                    case Inventory.IDS.PROPELLANT_TINY:
                        isPropellantBay = true
                        break
                }

                let entityType = 0
                switch(entity.label) {
                    case Entity.IDS.SHIP:
                        entityType = entity.Ship?.shipType ?? 0
                        break;
                    case Entity.IDS.BUILDING:
                        entityType= entity.Building?.buildingType ?? 0
                        break;
                }

                inventories.push({
                    entity: {
                        label: entity.label,
                        type: entityType,
                        id: entity.id,
                        name: getEntityName(entity),
                        lotIndex: entity.Location?.resolvedLocations?.lot?.lotIndex ?? 0,
                        owningCrewId: entity.Control?.controller?.id ?? 0,
                    },
                    isPropellantBay: isPropellantBay,
                    ...i
                })
            })
        });

        return inventories
    }
  }
  