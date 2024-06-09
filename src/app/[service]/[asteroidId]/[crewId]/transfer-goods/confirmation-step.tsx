import { type Inventory } from './actions'
import { Delivery } from './state'

export type ConfirmationStepProps = {
  inventories: Inventory[]
  destination: Inventory
  deliveries: Delivery[]
}

export const ConfirmationStep = ({}: ConfirmationStepProps) => {
  return <div className='flex flex-col gap-y-1'>confirmation</div>
}
