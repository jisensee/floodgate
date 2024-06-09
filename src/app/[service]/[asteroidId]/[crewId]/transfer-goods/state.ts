import { A } from '@mobily/ts-belt'
import { ProductAmount } from 'influence-typed-sdk/api'
import { Reducer, useReducer } from 'react'
import { P, match } from 'ts-pattern'
import { Inventory } from './actions'

export type InventoryType = 'ship' | 'warehouse'

export type Delivery = {
  source: Inventory
  contents: ProductAmount[]
}

export type State = {
  destination?: Inventory
  deliveries: Delivery[]
}

type SelectDestinationAction = {
  type: 'select-destination'
  destination: Inventory
}

type AddDelivery = {
  type: 'add-delivery'
  source: Inventory
}

type RemvoveDelivery = {
  type: 'remove-delivery'
  deliverySourceUuid: string
}

type UpdateDelivery = {
  type: 'update-delivery'
  deliverySourceUuid: string
  newContents: ProductAmount[]
}

export type Action =
  | SelectDestinationAction
  | AddDelivery
  | RemvoveDelivery
  | UpdateDelivery

const reducer: Reducer<State, Action> = (currentState, action) =>
  match(action)
    .returnType<State>()
    .with({ type: 'select-destination' }, (action) => ({
      step: 'select-destination',
      ...currentState,
      destination: action.destination,
    }))
    .with({ type: 'add-delivery' }, (action) => ({
      ...currentState,
      deliveries: [
        ...currentState.deliveries,
        { source: action.source, contents: [] },
      ],
    }))
    .with({ type: 'remove-delivery' }, (action) => ({
      ...currentState,
      deliveries: A.removeFirstBy(
        currentState.deliveries,
        action.deliverySourceUuid,
        (delivery, sourceUuid) => delivery.source.uuid === sourceUuid
      ),
    }))
    .with({ type: 'update-delivery' }, (action) => ({
      ...currentState,
      deliveries: currentState.deliveries.map((delivery) =>
        delivery.source.uuid === action.deliverySourceUuid
          ? { ...delivery, contents: action.newContents }
          : delivery
      ),
    }))
    .with(P._, () => currentState)
    .exhaustive()

export const useTransferGoodsState = () =>
  useReducer<Reducer<State, Action>>(reducer, { deliveries: [] })
