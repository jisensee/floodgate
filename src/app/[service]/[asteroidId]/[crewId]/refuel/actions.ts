'use server'

import { Product, Ship } from '@influenceth/sdk'
import { Inventory, ShipType } from '@influenceth/sdk'
import { InfluenceEntity, getEntityName } from 'influence-typed-sdk/api'
import { O } from '@mobily/ts-belt'
import { getInventories } from '@/inventory-actions'
import { influenceApi } from '@/lib/influence-api'

export type SourceInventory = {
    label: number
    type: number
    id: number
    slot: number
    name: string
    lotIndex: number
    fuelAmount: number
    owningCrewId: number
    isPropellantBay: boolean
  }
  
  export const getSourceInventories = async (
    address: string,
    asteroidId: number
  ): Promise<SourceInventory[]> => {
    const inventories = await getInventories(address, asteroidId)
    return inventories
      .map((i) => ({
        label: i.entity.label,
        type: i.entity.type,
        id: i.entity.id,
        slot: i.slot,
        name: i.entity.name,
        lotIndex: i.entity.lotIndex,
        owningCrewId: i.entity.owningCrewId,
        fuelAmount: i.contents?.find((c) => c.product === Product.IDS.HYDROGEN_PROPELLANT)?.amount ?? 0,
        isPropellantBay: i.isPropellantBay,
      }))
      .filter((i) => i.fuelAmount > 0)
  }
  
  export type Ship = {
    id: number
    name: string
    type: ShipType
    fuelAmount: number
    fuelCapacity: number
    lotIndex: number
    owningCrewId: number
  }
  
  const getFuelCapacity = (ship: ShipType) =>
    Inventory.getType(ship.propellantInventoryType).massConstraint / 1_000
  
  const getFuelAmount = (ship: InfluenceEntity) => {
    const propellantInventory = ship.Inventories.find(
      (inv) =>
        inv.inventoryType ===
        O.map(ship.Ship?.shipType, Ship.getType)?.propellantInventoryType
    )
  
    const fuel =
      propellantInventory?.contents?.find(
        (c) => c.product === Product.IDS.HYDROGEN_PROPELLANT
      )?.amount ?? 0
    // Reserved mass is in grams for some reason, we want it in kg
    const incomingFuel = (propellantInventory?.reservedMass ?? 0) / 1_000
  
    return fuel + incomingFuel
  }
  
  export const getShips = async (
    address: string,
    asteroidId: number,
    volumeBonus: number
  ): Promise<Ship[]> => {
    const ships = await influenceApi.util.ships(address, asteroidId)
  
    return ships
      .flatMap((ship) => {
        const lotIndex = ship.Location?.resolvedLocations?.lot?.lotIndex
        return ship.Ship && lotIndex
          ? [
              {
                id: ship.id,
                name: getEntityName(ship),
                type: Ship.getType(ship.Ship.shipType),
                fuelAmount: getFuelAmount(ship),
                fuelCapacity: getFuelCapacity(Ship.getType(ship.Ship.shipType)),
                owningCrewId: ship.Control?.controller?.id ?? 0,
                lotIndex,
              },
            ]
          : []
      })
      .filter((ship) => {
        const overfueledCapacity = ship.fuelCapacity * volumeBonus
        return ship.fuelAmount < overfueledCapacity
      })
  }