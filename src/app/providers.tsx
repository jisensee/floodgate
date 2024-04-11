'use client'

import { FC, PropsWithChildren } from 'react'
import { sepolia } from '@starknet-react/chains'
import {
  StarknetConfig,
  publicProvider,
  argent,
  braavos,
  useInjectedConnectors,
  voyager,
} from '@starknet-react/core'

export const Providers: FC<PropsWithChildren> = ({ children }) => {
  const { connectors } = useInjectedConnectors({
    recommended: [argent(), braavos()],
    includeRecommended: 'onlyIfNoConnectors',
    order: 'alphabetical',
  })
  return (
    <StarknetConfig
      chains={[sepolia]}
      provider={publicProvider()}
      connectors={connectors}
      explorer={voyager}
    >
      {children}
    </StarknetConfig>
  )
}
