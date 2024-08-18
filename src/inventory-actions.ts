'use server'

import { Entity, Inventory } from '@influenceth/sdk'
import { InfluenceEntity, getEntityName } from 'influence-typed-sdk/api'
import { EntityInventory } from 'influence-typed-sdk/api'
import { influenceApi } from '@/lib/influence-api'

export type Inventory = EntityInventory & {
  entity: {
    label: number
    type: number
    id: number
    uuid: string
    name: string
    lotIndex: number
    owningCrewId: number
  }
  isPropellantBay: boolean
  massCapacity: number
  volumeCapacity: number
}

const isPropellantBay = (inventoryType: number) =>
  [
    Inventory.IDS.PROPELLANT_LARGE,
    Inventory.IDS.PROPELLANT_MEDIUM,
    Inventory.IDS.PROPELLANT_SMALL,
    Inventory.IDS.PROPELLANT_TINY as number,
  ].includes(inventoryType)

const isValidInventory = (inventoryType: number) =>
  isPropellantBay(inventoryType) ||
  [
    Inventory.IDS.WAREHOUSE_PRIMARY,
    Inventory.IDS.TANK_FARM_PRIMARY as number,
  ].includes(inventoryType)

const getEntityType = (entity: InfluenceEntity) => {
  switch (entity.label) {
    case Entity.IDS.SHIP:
      return entity.Ship?.shipType ?? 0
    case Entity.IDS.BUILDING:
      return entity.Building?.buildingType ?? 0
  }
}

export const getInventories = async (
  ownerAddress: string,
  asteroidId: number
): Promise<Inventory[]> => {
  const [ships, warehouses] = await Promise.all([
    influenceApi.util.ships(ownerAddress, asteroidId),
    influenceApi.util.warehouses(ownerAddress, asteroidId),
  ])
  return [...ships, ...warehouses].flatMap((entity) => {
    const entityType = getEntityType(entity)
    if (!entityType) return []

    return entity.Inventories.filter((i) =>
      isValidInventory(i.inventoryType)
    ).map((i) => {
      const inventoryType = Inventory.getType(i.inventoryType)
      return {
        entity: {
          label: entity.label,
          type: entityType,
          uuid: entity.uuid ?? '',
          id: entity.id,
          name: getEntityName(entity),
          lotIndex: entity.Location?.resolvedLocations?.lot?.lotIndex ?? 0,
          owningCrewId: entity.Control?.controller?.id ?? 0,
        },
        isPropellantBay: isPropellantBay(i.inventoryType),
        massCapacity: inventoryType.massConstraint / 1000,
        volumeCapacity: inventoryType.volumeConstraint / 1000,
        ...i,
      }
    })
  })
}

