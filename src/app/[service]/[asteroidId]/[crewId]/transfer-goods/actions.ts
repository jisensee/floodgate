'use server'

import { Entity, Inventory, ShipType } from '@influenceth/sdk'
import { ProductAmount } from 'influence-typed-sdk/api'
import { A, pipe } from '@mobily/ts-belt'
import { influenceApi } from '@/lib/influence-api'
import { getBaseName, getStorageInventoryId } from '@/lib/utils'
import { FloodgateCrew } from '@/lib/contract-types'

type BaseInventory = {
  id: number
  name: string
  uuid: string
  inventoryType: number
  contents: ProductAmount[]
  massCapacity: number
  volumeCapacity: number
  reservedMass: number
  reservedVolume: number
  owningCrewId: number
  lotIndex: number
}

export type ShipInventory = BaseInventory & {
  type: 'ship'
  shipType: ShipType
}

export type WarehouseInventory = BaseInventory & {
  type: 'warehouse'
}

export type Inventory = ShipInventory | WarehouseInventory

export const getInventories = async (
  address: string,
  crew: FloodgateCrew
): Promise<Inventory[]> => {
  const [ships, warehouses] = await Promise.all([
    influenceApi.util.ships(address, crew.asteroidId),
    influenceApi.util.warehouses(address, crew.asteroidId),
  ])
  return pipe(
    ships,
    A.concat(warehouses),
    A.keepMap((entity) => {
      const name = entity.Name ?? getBaseName(entity)
      const inventoryId = getStorageInventoryId(entity)

      const owningCrewId = entity.Control?.controller.id

      if (inventoryId === undefined || owningCrewId === undefined) return

      const inventory = entity.Inventories.find(
        (i) => i.inventoryType === inventoryId
      )
      const lotIndex = entity.Location?.locations?.lot?.lotIndex
      if (inventory === undefined || lotIndex === undefined) return

      const base = {
        id: entity.id,
        name,
        uuid: Entity.packEntity(entity),
        inventoryType: inventoryId,
        contents: inventory.contents,
        massCapacity: Inventory.getType(inventoryId).massConstraint / 1000,
        volumeCapacity: Inventory.getType(inventoryId).volumeConstraint / 1000,
        reservedMass: inventory.reservedMass / 1000,
        reservedVolume: inventory.reservedVolume / 1000,
        owningCrewId,
        lotIndex,
      }
      return entity.Ship
        ? {
            type: 'ship',
            shipType: entity.Ship.shipType,
            ...base,
          }
        : { type: 'warehouse', ...base }
    }),
    A.keep(
      (i) =>
        i.id !== crew.feedingConfig.inventoryId &&
        i.inventoryType !== crew.feedingConfig.inventoryType
    )
  )
}
