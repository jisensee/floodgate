import { A, D, N, O, pipe } from '@mobily/ts-belt'
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

type Reset = {
  type: 'reset'
}

export type Action =
  | SelectDestinationAction
  | AddDelivery
  | RemvoveDelivery
  | UpdateDelivery
  | Reset

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
        {
          source: action.source,
          contents: action.source.contents.map((p) => ({ ...p, amount: 0 })),
        },
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
    .with({ type: 'reset' }, () => ({
      deliveries: [],
    }))
    .with(P._, () => currentState)
    .exhaustive()

export const useTransferGoodsState = () =>
  useReducer<Reducer<State, Action>>(reducer, { deliveries: [] })

export const getDeliveriesContents = (deliveries: Delivery[]) =>
  pipe(
    deliveries,
    A.map(D.prop('contents')),
    A.flat,
    A.groupBy((p) => p.product.i),
    D.values,
    A.keepMap(
      O.mapNullable((amounts) => {
        const product = amounts?.[0]?.product
        if (!product) return undefined

        const amount = amounts.map((a) => a.amount).reduce(N.add)
        if (amount === 0) return undefined

        return {
          product,
          amount,
        }
      })
    )
  )
