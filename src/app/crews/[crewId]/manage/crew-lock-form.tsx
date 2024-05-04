'use client'

import { LockOpen, Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useSetCrewLocked } from '@/hooks/contract'
import { useTransactionToast } from '@/hooks/transaction-toast'
import { FloodgateCrew } from '@/lib/contract-types'

export const CrewLockForm = ({ crew }: { crew: FloodgateCrew }) => {
  const { refresh } = useRouter()

  const {
    write: toggleLocked,
    data,
    error,
    status,
  } = useSetCrewLocked(crew.id, !crew.locked)

  const { isLoading } = useTransactionToast({
    txHash: data?.transaction_hash,
    submitError: error ?? undefined,
    submitStatus: status,
    successMessage: `Crew has been ${crew.locked ? 'locked' : 'unlocked'}!`,
    pendingMessage: `${crew.locked ? 'Unlocking' : 'Locking'} crew...`,
    onSuccess: refresh,
  })

  return (
    <div className='flex flex-col items-center gap-y-2'>
      <p className='text-sm text-muted-foreground'>
        Locking a crew will prevent it being used until it is unlocked again.
        You can still manage the crew as normal while it is locked.
      </p>
      <Button
        className='w-fit'
        variant='accent'
        loading={isLoading}
        onClick={() => toggleLocked()}
        icon={crew.locked ? <LockOpen /> : <Lock />}
      >
        {crew.locked ? 'Unlock' : 'Lock'} Crew
      </Button>
    </div>
  )
}
