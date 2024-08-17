import { Reducer, useReducer } from 'react'
import { Ship, SourceInventory } from './actions'

export type State = {
  selectedShip?: Ship
  selectedInventory?: SourceInventory
  ships: Ship[]
  inventories: SourceInventory[]
  dataLoading: boolean
}

export type SelectShip = {
  type: 'select-ship'
  ship: Ship
}

export type SelectInventory = {
  type: 'select-inventory'
  inventory: SourceInventory
}

export type SetData = {
  type: 'set-data'
  ships: Ship[]
  inventories: SourceInventory[]
}

export type Reset = {
  type: 'reset'
}

export type Action = SelectShip | SelectInventory | SetData | Reset

export const useRefuelWizardState = () =>
  useReducer<Reducer<State, Action>>(
    (state, action) => {
      switch (action.type) {
        case 'select-ship':
          return {
            ...state,
            selectedShip: action.ship,
            selectedInventory: undefined,
          }
        case 'select-inventory':
          return { ...state, selectedInventory: action.inventory }
        case 'set-data':
          return {
            ...state,
            ships: action.ships,
            inventories: action.inventories,
            dataLoading: false,
          }
        case 'reset':
          return {
            ...state,
            selectedShip: undefined,
            selectedInventory: undefined,
          }
      }
    },
    { ships: [], inventories: [], dataLoading: true }
  )
