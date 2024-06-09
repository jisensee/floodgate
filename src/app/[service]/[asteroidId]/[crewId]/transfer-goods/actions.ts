'use server'

import { Entity, Inventory, ShipType } from '@influenceth/sdk'
import { ProductAmount } from 'influence-typed-sdk/api'
import { A, pipe } from '@mobily/ts-belt'
import { influenceApi } from '@/lib/influence-api'
import { getBaseName, getStorageInventoryId } from '@/lib/utils'

type BaseInventory = {
  id: number
  name: string
  uuid: string
  contents: ProductAmount[]
  massCapacity: number
  volumeCapacity: number
  reservedMass: number
  reservedVolume: number
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
  asteroidId: number
): Promise<Inventory[]> => {
  const [ships, warehouses] = await Promise.all([
    influenceApi.util.ships(address, asteroidId),
    influenceApi.util.warehouses(address, asteroidId),
  ])
  return pipe(
    ships,
    A.concat(warehouses),
    A.keepMap((entity) => {
      const name = entity.Name ?? getBaseName(entity)
      const inventoryId = getStorageInventoryId(entity)

      if (inventoryId === undefined) return

      const inventory = entity.Inventories.find(
        (i) => i.inventoryType === inventoryId
      )
      if (inventory === undefined) return

      const base = {
        id: entity.id,
        name,
        uuid: Entity.packEntity(entity),
        contents: inventory.contents,
        massCapacity: Inventory.getType(inventoryId).massConstraint,
        volumeCapacity: Inventory.getType(inventoryId).volumeConstraint,
        reservedMass: inventory.reservedMass,
        reservedVolume: inventory.reservedVolume,
      }
      return entity.Ship
        ? {
            type: 'ship',
            shipType: entity.Ship.shipType,
            ...base,
          }
        : { type: 'warehouse', ...base }
    })
  )
}
