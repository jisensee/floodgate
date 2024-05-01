import { Dispatch, Reducer, useReducer } from 'react'
import { Ship, Warehouse } from '@/actions'
import { ContractCrew } from '@/lib/contract'

export type State = {
  selectedShip?: Ship
  selectedWarehouse?: Warehouse
  ships: Ship[]
  warehouses: Warehouse[]
  dataLoading: boolean
}

export type SelectShip = {
  type: 'select-ship'
  ship: Ship
}

export type SelectWarehouse = {
  type: 'select-warehouse'
  warehouse: Warehouse
}

export type SetData = {
  type: 'set-data'
  ships: Ship[]
  warehouses: Warehouse[]
}

export type Reset = {
  type: 'reset'
}

export type Action = SelectShip | SelectWarehouse | SetData | Reset

export const useRefuelWizardState = () =>
  useReducer<Reducer<State, Action>>(
    (state, action) => {
      switch (action.type) {
        case 'select-ship':
          return {
            ...state,
            selectedShip: action.ship,
            selectedWarehouse: undefined,
          }
        case 'select-warehouse':
          return { ...state, selectedWarehouse: action.warehouse }
        case 'set-data':
          return {
            ...state,
            ships: action.ships,
            warehouses: action.warehouses,
            dataLoading: false,
          }
        case 'reset':
          return {
            ...state,
            selectedShip: undefined,
            selectedWarehouse: undefined,
          }
      }
    },
    { ships: [], warehouses: [], dataLoading: true }
  )

export type StepProps = {
  state: State
  dispatch: Dispatch<Action>
  crew: ContractCrew
}
