'use client'

import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUnregisterCrew } from '@/hooks/contract'
import { FloodgateCrew } from '@/lib/contract-types'
import { useTransactionToast } from '@/hooks/transaction-toast'

export const UnregisterForm = ({
  crew,
  address,
}: {
  crew: FloodgateCrew
  address: string
}) => {
  const isOwner = BigInt(address) === crew.ownerAddress

  const {
    write: unregister,
    data,
    status,
    error,
  } = useUnregisterCrew(crew.id, isOwner ? address : undefined)
  const { isLoading } = useTransactionToast({
    txHash: data?.transaction_hash,
    submitStatus: status,
    submitError: error,
    successMessage: 'Crew unregistered!',
    pendingMessage: 'Unregistering crew...',
  })

  return (
    <div className='flex flex-col items-center gap-y-2'>
      <p className='text-sm text-muted-foreground'>
        Unregistering a crew will remove it from Floodgate and prevent it from
        being used. You will still be able to withdrow any remaining revenue.
        The owner of the the crew can re-register the crew at any time.
      </p>
      <Button
        className='w-fit'
        variant='destructive'
        onClick={() => unregister()}
        icon={<Trash2 />}
        loading={isLoading}
      >
        Unregister Crew
      </Button>
      {!isOwner && (
        <p className='text-center text-sm text-warning'>
          You are not the owner and therefore this crew will not be delegated
          back when unregistering.
        </p>
      )}
    </div>
  )
}
