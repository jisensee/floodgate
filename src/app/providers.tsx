'use client'

import { FC, PropsWithChildren } from 'react'
import { sepolia } from '@starknet-react/chains'
import {
  StarknetConfig,
  argent,
  braavos,
  useInjectedConnectors,
  voyager,
  jsonRpcProvider,
} from '@starknet-react/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

export const Providers: FC<PropsWithChildren> = ({ children }) => {
  const { connectors } = useInjectedConnectors({
    recommended: [argent(), braavos()],
    includeRecommended: 'onlyIfNoConnectors',
    order: 'alphabetical',
  })
  return (
    <QueryClientProvider client={queryClient}>
      <StarknetConfig
        chains={[sepolia]}
        provider={jsonRpcProvider({
          rpc: () => ({
            nodeUrl: 'https://starknet-sepolia.public.blastapi.io',
          }),
        })}
        connectors={connectors}
        explorer={voyager}
        autoConnect
      >
        {children}
      </StarknetConfig>
    </QueryClientProvider>
  )
}
