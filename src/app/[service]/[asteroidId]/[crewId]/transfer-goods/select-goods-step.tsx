import { Dispatch, useState } from 'react'
import { type Inventory } from './actions'
import { Action, Delivery } from './state'
import { InventoryCard } from './inventory-card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export type SelectGoodsStepProps = {
  inventories: Inventory[]
  destination: Inventory
  deliveries: Delivery[]
  dispatch: Dispatch<Action>
}

export const SelectGoodsStep = ({
  inventories,
  destination,
  dispatch,
}: SelectGoodsStepProps) => {
  const [addSourceDialogOpen, setAddSourceDialogOpen] = useState(false)

  const availableSources = inventories.filter(
    (i) => destination.uuid !== i.uuid
  )

  return (
    <div className='flex flex-col gap-y-1'>
      <p>select goods</p>
      <AddSourceDialog
        open={addSourceDialogOpen}
        onOpenChange={setAddSourceDialogOpen}
        sources={availableSources}
        onSelect={(i) => {
          dispatch({
            type: 'add-delivery',
            source: i,
          })
          setAddSourceDialogOpen(false)
        }}
      />
    </div>
  )
}

type AddSourceDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  sources: Inventory[]
  onSelect: (inventory: Inventory) => void
}
const AddSourceDialog = ({
  open,
  onOpenChange,
  sources,
  onSelect,
}: AddSourceDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogTrigger asChild>
      <Button onClick={() => onOpenChange(true)}>Add source</Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>Add source</DialogHeader>
      {sources.map((source) => (
        <InventoryCard
          key={source.uuid}
          inventory={source}
          onSelect={() => onSelect(source)}
        />
      ))}
    </DialogContent>
  </Dialog>
)
