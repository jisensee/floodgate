import { Building, Crew, Crewmate, Inventory, Product } from '@influenceth/sdk'
import { A, D, O, pipe } from '@mobily/ts-belt'
import { type ClassValue, clsx } from 'clsx'
import { InfluenceEntity, ProductAmount } from 'influence-typed-sdk/api'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const Format = {
  duration: (seconds: number) => {
    if (seconds === 0) {
      return '0s'
    }
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = Math.floor(seconds % 60)

    const parts = []
    if (days > 0) {
      parts.push(`${days}d`)
    }
    if (hours > 0) {
      parts.push(`${hours}h`)
    }
    if (minutes > 0) {
      parts.push(`${minutes}m`)
    }
    if (remainingSeconds > 0) {
      parts.push(`${remainingSeconds}s`)
    }
    return parts.join(' ')
  },
  distance: (kilometers: number) =>
    kilometers.toLocaleString(undefined, { maximumFractionDigits: 1 }) + 'km',
  mass: (kilograms: number) => {
    if (kilograms < 1000) {
      return `${kilograms}kg`
    }
    if (kilograms < 1_000_000) {
      return Math.round(kilograms / 1000) + 't'
    }
    if (kilograms < 1_000_000_000) {
      return (
        (kilograms / 1_000_000).toLocaleString(undefined, {
          maximumFractionDigits: 1,
        }) + 'kt'
      )
    }
    return (
      (kilograms / 1_000_000_000).toLocaleString(undefined, {
        maximumFractionDigits: 1,
      }) + 'Mt'
    )
  },
  volume: (liters: number) =>
    (liters / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 }) +
    'm³',
}

export const getCrewBonuses = (
  crew: InfluenceEntity,
  crewmates: InfluenceEntity[],
  station: InfluenceEntity
) => {
  const getBonus = (abilityId: number) =>
    Crew.getAbilityBonus(
      abilityId,
      crewmates,
      {
        population: station.Station?.population ?? 0,
        stationType: station.Station?.stationType.i ?? 0,
      },
      ((new Date().getTime() - (crew?.Crew?.lastFed?.getTime() ?? 0)) / 1000) *
        24
    )

  return {
    transportTime: getBonus(Crewmate.ABILITY_IDS.HOPPER_TRANSPORT_TIME),
    massCapacity: getBonus(Crewmate.ABILITY_IDS.INVENTORY_MASS_CAPACITY),
    volumeCapacity: getBonus(Crewmate.ABILITY_IDS.INVENTORY_VOLUME_CAPACITY),
    foodConsumptionTime: getBonus(Crewmate.ABILITY_IDS.FOOD_CONSUMPTION_TIME),
  }
}

export const getFoodRatio = (
  crew: InfluenceEntity,
  crewmates: InfluenceEntity[],
  station: InfluenceEntity
) => {
  const timeSinceFed: number =
    ((new Date().getTime() - (crew?.Crew?.lastFed?.getTime() ?? 0)) / 1000) * 24
  const consumption: number = getCrewBonuses(crew, crewmates, station)
    .foodConsumptionTime.totalBonus
  return Crew.getCurrentFoodRatio(timeSinceFed, consumption)
}

export type CrewBonuses = ReturnType<typeof getCrewBonuses>

export const pluralize = (
  number: number,
  singular: string,
  plural?: string
) => {
  if (number === 1) {
    return singular
  }
  return plural ?? `${singular}s`
}

export const getFoodAmount = (warehouse: InfluenceEntity) =>
  pipe(
    warehouse.Inventories,
    A.find((i) => i.inventoryType === Inventory.IDS.WAREHOUSE_PRIMARY),
    O.map(D.prop('contents')),
    O.mapNullable(A.find((c) => c.product.i === Product.IDS.FOOD)),
    O.map(D.prop('amount')),
    O.getWithDefault<number>(0)
  )

export const getBaseName = (influenceEntity: InfluenceEntity) => {
  if (influenceEntity.Name) return influenceEntity.Name

  if (influenceEntity.Ship) {
    return `${influenceEntity.Ship.shipType.name}#${influenceEntity.id}`
  }
  if (influenceEntity.Building) {
    return `${influenceEntity.Building.buildingType.name}#${influenceEntity.id}`
  }
  if (influenceEntity.Crew) {
    return `Crew#${influenceEntity.id}`
  }
  return `Unknown#${influenceEntity.id}`
}

export const getStorageInventoryId = (influenceEntity: InfluenceEntity) => {
  if (influenceEntity.Ship)
    return influenceEntity.Ship.shipType.cargoInventoryType

  if (influenceEntity.Building)
    return influenceEntity.Building?.buildingType.i === Building.IDS.WAREHOUSE
      ? Inventory.IDS.WAREHOUSE_PRIMARY
      : undefined
}

export const calcMassAndVolume = (contents: ProductAmount[]) =>
  A.reduce(contents, { mass: 0, volume: 0 }, (curr, next) => ({
    mass: curr.mass + next.amount * (next.product.massPerUnit / 1000),
    volume: curr.volume + next.amount * (next.product.volumePerUnit / 1000),
  }))
