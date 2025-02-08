'use client'

import { FC, PropsWithChildren } from 'react'
import { mainnet, sepolia } from '@starknet-react/chains'
import { Provider as JotaiProvider } from 'jotai'
import {
  StarknetConfig,
  jsonRpcProvider,
  publicProvider,
  voyager,
} from '@starknet-react/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { O } from '@mobily/ts-belt'
import { WebWalletConnector } from 'starknetkit/webwallet'
import { InjectedConnector } from 'starknetkit/injected'
import { nodeUrl } from '@/lib/contracts'
import { env } from '@/env'

const queryClient = new QueryClient()

export const Providers: FC<PropsWithChildren> = ({ children }) => {
  const connectors = [
    new WebWalletConnector({ url: 'https://web.argent.xyz' }),
    new InjectedConnector({ options: { id: 'argentX' } }),
    new InjectedConnector({ options: { id: 'braavos' } }),
  ]

  return (
    <JotaiProvider>
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
    </JotaiProvider>
  )
}
