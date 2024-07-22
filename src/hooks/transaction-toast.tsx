import { useTransactionReceipt } from '@starknet-react/core'
import { Check, CircleAlert, LoaderCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export type TransactionToastOptions = {
  txHash?: string
  submitStatus: 'error' | 'success' | 'pending' | 'idle'
  submitError?: Error | null
  pendingMessage: string
  successMessage?: string
  onSuccess?: () => void
}
export const useTransactionToast = ({
  txHash,
  submitStatus,
  submitError,
  pendingMessage,
  successMessage,
  onSuccess,
}: TransactionToastOptions) => {
  const {
    isLoading: txLoading,
    error: txError,
    status: txStatus,
  } = useTransactionReceipt({ hash: txHash, retry: true })

  const [toastId, setToastId] = useState<number | string | undefined>()

  useEffect(() => {
    if (txStatus !== 'success') return

    if (successMessage) {
      toast.success(successMessage, {
        id: toastId,
        icon: <Check />,
        cancel: { label: 'Dismiss', onClick: () => {} },
      })
    } else {
      toast.dismiss(toastId)
    }
    onSuccess?.()
  }, [txStatus, toastId, successMessage, onSuccess])

  useEffect(() => {
    if (submitStatus === 'success' && !toastId) {
      setToastId(
        toast.success(pendingMessage, {
          icon: <LoaderCircle className='animate-spin' />,
          duration: 1e9,
        })
      )
    } else if (submitError) {
      toast.error(`Error when submitting tx: ${submitError.message}`, {
        duration: 1e9,
        cancel: { label: 'Dismiss', onClick: () => {} },
        icon: <CircleAlert />,
      })
    } else if (txError) {
      toast.error(`Error when executing tx: ${txError.message}`, {
        id: toastId,
        cancel: { label: 'Dismiss', onClick: () => {} },
        icon: <CircleAlert />,
      })
    }
  }, [submitError, submitStatus, pendingMessage, txError, toastId])

  return {
    status: txStatus,
    error: txError,
    isLoading: txLoading || submitStatus === 'pending',
  }
}
