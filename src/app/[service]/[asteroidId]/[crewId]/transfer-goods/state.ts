import { A } from '@mobily/ts-belt'
import { ProductAmount } from 'influence-typed-sdk/api'
import { Reducer, useReducer } from 'react'
import { P, match } from 'ts-pattern'

export type InventoryType = 'ship' | 'warehouse'

export type DeliveryInventory = {
  inventoryType: InventoryType
  inventoryId: string
}

export type DestinationInventory = {
  currentContents: ProductAmount[]
  inventory: DeliveryInventory
  massCapacity: number
  volumeCapacity: number
}

export type Delivery = {
  source: DeliveryInventory
  contents: ProductAmount[]
}

type SelectDestinationState = {
  step: 'select-destination'
  destination?: DeliveryInventory
}

type SelectGoodsState = {
  step: 'select-goods'
  destination: DestinationInventory
  deliveries: Delivery[]
}

type ConfirmState = {
  step: 'confirm'
  destination: DestinationInventory
  deliveries: Delivery[]
}

export type State = SelectDestinationState | SelectGoodsState | ConfirmState
export type Step = State['step']

type SelectDestinationAction = {
  type: 'select-destination'
  destination: DeliveryInventory
}

type CompleteSelectDestinationStep = {
  type: 'complete-select-destination-step'
  destination: DestinationInventory
}

type CompleteSelectGoodsStep = {
  type: 'complete-select-goods-step'
}

type AddDelivery = {
  type: 'add-delivery'
  delivery: Delivery
}

type RemvoveDelivery = {
  type: 'remove-delivery'
  delivery: DeliveryInventory
}

type UpdateDelivery = {
  type: 'update-delivery'
  delivery: DeliveryInventory
  newContents: ProductAmount[]
}

export type Action =
  | CompleteSelectDestinationStep
  | CompleteSelectGoodsStep
  | SelectDestinationAction
  | AddDelivery
  | RemvoveDelivery
  | UpdateDelivery

const reducer: Reducer<State, Action> = (currentState, action) =>
  match([currentState, action])
    .returnType<State>()
    .with(
      [
        { step: 'select-destination', destination: P.nonNullable },
        { type: 'complete-select-destination-step' },
      ],
      ([, action]) => ({
        step: 'select-goods',
        destination: action.destination,
        deliveries: [],
      })
    )
    .with(
      [{ step: 'select-goods' }, { type: 'complete-select-goods-step' }],
      ([state]) => state.deliveries.length > 0,
      ([state]) => ({
        step: 'confirm',
        destination: state.destination,
        deliveries: state.deliveries,
      })
    )
    .with(
      [{ step: 'select-destination' }, { type: 'select-destination' }],
      ([, action]) => ({
        step: 'select-destination',
        destination: action.destination,
      })
    )
    .with(
      [{ step: 'select-goods' }, { type: 'add-delivery' }],
      ([state, action]) => ({
        ...state,
        deliveries: [...state.deliveries, action.delivery],
      })
    )
    .with(
      [{ step: 'select-goods' }, { type: 'remove-delivery' }],
      ([state, action]) => ({
        ...state,
        deliveries: A.removeFirstBy(
          state.deliveries,
          action.delivery,
          deliveryEquals
        ),
      })
    )
    .with(
      [{ step: 'select-goods' }, { type: 'update-delivery' }],
      ([state, action]) => ({
        ...state,
        deliveries: state.deliveries.map((d) =>
          deliveryEquals(d, action.delivery)
            ? { ...d, contents: action.newContents }
            : d
        ),
      })
    )
    .with(P._, () => currentState)
    .exhaustive()

export const useTransferGoodsState = () =>
  useReducer<Reducer<State, Action>>(reducer, { step: 'select-destination' })

const deliveryInventoryEquals = (a: DeliveryInventory, b: DeliveryInventory) =>
  a.inventoryType === b.inventoryType && a.inventoryId === b.inventoryId

const deliveryEquals = (
  delivery: Delivery,
  deliveryInventory: DeliveryInventory
) => deliveryInventoryEquals(delivery.source, deliveryInventory)
