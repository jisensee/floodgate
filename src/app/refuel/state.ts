import { Dispatch, Reducer, useReducer } from 'react'
import { Ship, Warehouse } from '@/actions'
import { CrewData } from '@/hooks/contract'

export type State = {
  selectedShip?: Ship
  selectedWarehouse?: Warehouse
  ships: Ship[]
  warehouses: Warehouse[]
  crewData?: CrewData
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
  crewData: CrewData
}

export type Action = SelectShip | SelectWarehouse | SetData

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
            crewData: action.crewData,
            dataLoading: false,
          }
      }
    },
    { ships: [], warehouses: [], dataLoading: true }
  )

export type StepProps = {
  state: State
  dispatch: Dispatch<Action>
}
