import { Contract, RpcProvider } from 'starknet'
import { ABI as floodgateAbi } from '../abis/floodgate'
import { env } from '@/env'

const provider = new RpcProvider({
  nodeUrl: 'https://starknet-sepolia.public.blastapi.io',
})

export const floodgateContract = new Contract(
  // @ts-expect-error type
  floodgateAbi,
  env.NEXT_PUBLIC_FLOODGATE_CONTRACT_ADDRESS,
  provider
).typed(floodgateAbi)
