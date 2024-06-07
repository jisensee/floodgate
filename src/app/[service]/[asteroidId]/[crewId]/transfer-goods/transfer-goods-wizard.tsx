'use client'

import { FloodgateCrew } from '@/lib/contract-types'

export type TransferGoodsWizardProps = {
  crew: FloodgateCrew
}

export const TransferGoodsWizard = ({ crew }: TransferGoodsWizardProps) => {
  return <p>transfer goods {crew.name}</p>
}
