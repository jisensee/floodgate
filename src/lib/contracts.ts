import { Contract, RpcProvider } from 'starknet'
import { ABI as overfuelerAbi } from '../abis/overfueler'
import { env } from '@/env'

const provider = new RpcProvider({
  nodeUrl: 'https://free-rpc.nethermind.io/sepolia-juno/',
})

export const overfuelerContract = new Contract(
  // @ts-expect-error typed are weird
  overfuelerAbi,
  env.NEXT_PUBLIC_REFUELER_CONTRACT_ADDRESS,
  provider
).typed(overfuelerAbi)
