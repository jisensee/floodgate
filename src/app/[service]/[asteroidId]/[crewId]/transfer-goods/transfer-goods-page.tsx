'use client'

import { useAccount } from '@starknet-react/core'
import { TransferGoodsWizard } from './transfer-goods-wizard'
import { FloodgateCrew } from '@/lib/contract-types'
import { ConnectWalletButton } from '@/components/connect-wallet-button'

export const TransferGoodsPage = ({ crew }: { crew: FloodgateCrew }) => {
  const { address } = useAccount()
  const actionFee = crew.services.find(
    (s) => s.serviceType === 'RefuelShip' && s.enabled
  )?.actionSwayFee
  if (!actionFee) {
    return null
  }
  return (
    <>
      {address && (
        <TransferGoodsWizard
          address={address}
          crew={crew}
          actionFee={actionFee}
        />
      )}
      {!address && (
        <div className='flex h-full flex-col items-center justify-center gap-y-5 text-xl'>
          <p>You need to connect your wallet to transfer goods.</p>
          <ConnectWalletButton />
        </div>
      )}
    </>
  )
}
