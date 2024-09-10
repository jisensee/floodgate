import { Contract, RpcProvider } from 'starknet'
import { O } from '@mobily/ts-belt'
import { ABI as floodgateAbi } from '../abis/floodgate'
import dispatcherAbi from '../abis/influence-dispatcher.json'
import swayAbi from '../abis/sway.json'
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
  floodgateAbi,
  env.NEXT_PUBLIC_FLOODGATE_CONTRACT_ADDRESS,
  provider
).typedv2(floodgateAbi)

export const influenceDispatcherContract = new Contract(
  dispatcherAbi,
  env.NEXT_PUBLIC_INFLUENCE_DISPATCHER_CONTRACT_ADDRESS,
  provider
)

export const swayContract = new Contract(
  swayAbi,
  env.NEXT_PUBLIC_SWAY_CONTRACT_ADDRESS,
  provider
)

export const getGenericFeeCalls = (
  baseFee: number,
  multiplier: number,
  isDevTeam?: boolean
) => {
  const fee = BigInt(Math.round(baseFee * Math.sqrt(multiplier))) * 1_000_000n
  const calls = isDevTeam
    ? []
    : [
        swayContract.populateTransaction['increase_allowance']?.(
          floodgateContract.address,
          fee
        ),
        floodgateContract.populateTransaction.collect_generic_fee(fee),
      ]
  return { calls, fee }
}
