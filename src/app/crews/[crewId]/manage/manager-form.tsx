import { Save } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSetCrewManager } from '@/hooks/contract'
import { FloodgateCrew } from '@/lib/contract-types'
import { useTransactionToast } from '@/hooks/transaction-toast'

export const ManagerForm = ({ crew }: { crew: FloodgateCrew }) => {
  const [managerAddress, setManagerAddress] = useState(
    '0x' + crew.managerAddress.toString(16)
  )

  const {
    send: setCrewManager,
    data,
    status,
    error,
  } = useSetCrewManager(crew.id, managerAddress)
  const { isLoading } = useTransactionToast({
    txHash: data?.transaction_hash,
    submitStatus: status,
    submitError: error,
    successMessage: 'Manager address set!',
    pendingMessage: 'Setting new manager address...',
  })

  return (
    <div className='flex flex-col items-center'>
      <div className='flex flex-col gap-y-2'>
        <p className='text-sm text-muted-foreground'>
          The manager address determines who can manage this crew and collect
          revenue. The owner of the crew can always re-register the crew and
          assign a different manager address.
        </p>
        <Label>Manager address</Label>
        <Input
          value={managerAddress}
          onChange={(e) => setManagerAddress(e.target.value)}
        />
      </div>
      <Button
        className='mt-2 w-fit'
        variant='accent'
        onClick={() => setCrewManager()}
        icon={<Save />}
        loading={isLoading}
      >
        Set Manager
      </Button>
    </div>
  )
}
