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
import { ProviderInterface, ProviderOptions } from 'starknet'
import { nodeUrl } from '@/lib/contracts'
import { env } from '@/env'

const queryClient = new QueryClient()

class MyWebWalletConnector extends WebWalletConnector {
  private address?: string

  async connect() {
    const result = await super.connect()
    this.address = result.account
    return result
  }
  async account(provider: ProviderOptions | ProviderInterface) {
    const acc = await super.account(provider)
    if (this.address) {
      acc.address = this.address
    }
    return acc
  }
}

export const Providers: FC<PropsWithChildren> = ({ children }) => {
  const connectors = [
    new MyWebWalletConnector({ url: 'https://web.argent.xyz' }),
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
