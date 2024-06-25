import { Contract, RpcProvider } from 'starknet'
import { O } from '@mobily/ts-belt'
import { ABI as floodgateAbi } from '../abis/floodgate'
import { env } from '@/env'

export const nodeUrl = O.map(
  env.NEXT_PUBLIC_ALCHEMY_API_KEY,
  (apiKey) =>
    `https://starknet-${env.NEXT_PUBLIC_CHAIN === 'mainnet' ? 'mainnet' : 'sepolia'}.g.alchemy.com/starknet/version/rpc/v0_7/${apiKey}`
)

const provider = new RpcProvider({
  nodeUrl: nodeUrl ?? 'https://starknet-sepolia.public.blastapi.io',
})

export const floodgateContract = new Contract(
  // @ts-expect-error type
  floodgateAbi,
  env.NEXT_PUBLIC_FLOODGATE_CONTRACT_ADDRESS,
  provider
).typed(floodgateAbi)
