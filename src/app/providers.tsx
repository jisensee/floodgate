'use client'

import { FC, PropsWithChildren } from 'react'
import { mainnet, sepolia } from '@starknet-react/chains'
import {
  StarknetConfig,
  argent,
  braavos,
  jsonRpcProvider,
  publicProvider,
  useInjectedConnectors,
  voyager,
} from '@starknet-react/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { O } from '@mobily/ts-belt'
import { env } from '@/env'
import { nodeUrl } from '@/lib/contracts'

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
        chains={env.NEXT_PUBLIC_CHAIN === 'mainnet' ? [mainnet] : [sepolia]}
        provider={O.mapWithDefault(nodeUrl, publicProvider(), (nodeUrl) =>
          jsonRpcProvider({
            rpc: () => ({
              nodeUrl,
            }),
          })
        )}
        connectors={connectors}
        explorer={voyager}
        autoConnect
      >
        {children}
      </StarknetConfig>
    </QueryClientProvider>
  )
}
