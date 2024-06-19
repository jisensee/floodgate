'use client'

import { FC, PropsWithChildren } from 'react'
import { mainnet, sepolia } from '@starknet-react/chains'
import {
  StarknetConfig,
  argent,
  braavos,
  useInjectedConnectors,
  voyager,
  jsonRpcProvider,
} from '@starknet-react/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { env } from '@/env'

const queryClient = new QueryClient()

export const Providers: FC<PropsWithChildren> = ({ children }) => {
  const { connectors } = useInjectedConnectors({
    recommended: [argent(), braavos()],
    includeRecommended: 'onlyIfNoConnectors',
    order: 'alphabetical',
  })
  const chain = env.NEXT_PUBLIC_CHAIN
  return (
    <QueryClientProvider client={queryClient}>
      <StarknetConfig
        chains={chain === 'mainnet' ? [mainnet] : [sepolia]}
        provider={jsonRpcProvider({
          rpc: () => ({
            nodeUrl:
              chain === 'mainnet'
                ? undefined
                : 'https://starknet-sepolia.public.blastapi.io',
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
