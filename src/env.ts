import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    INFLUENCE_API_ACCESS_TOKEN: z.string().startsWith('ey'),
  },
  client: {
    NEXT_PUBLIC_FLOODGATE_CONTRACT_ADDRESS: z.string().startsWith('0x'),
    NEXT_PUBLIC_INFLUENCE_DISPATCHER_CONTRACT_ADDRESS: z
      .string()
      .startsWith('0x'),
    NEXT_PUBLIC_SWAY_CONTRACT_ADDRESS: z.string().startsWith('0x'),
    NEXT_PUBLIC_INFLUENCE_CLOUDFRONT_IMAGE_HOST: z.string().min(1),
    NEXT_PUBLIC_CHAIN: z.enum(['mainnet', 'testnet']),
    NEXT_PUBLIC_ALCHEMY_API_KEY: z.string().min(1).optional(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_FLOODGATE_CONTRACT_ADDRESS:
      process.env.NEXT_PUBLIC_FLOODGATE_CONTRACT_ADDRESS,
    NEXT_PUBLIC_INFLUENCE_DISPATCHER_CONTRACT_ADDRESS:
      process.env.NEXT_PUBLIC_INFLUENCE_DISPATCHER_CONTRACT_ADDRESS,
    NEXT_PUBLIC_SWAY_CONTRACT_ADDRESS:
      process.env.NEXT_PUBLIC_SWAY_CONTRACT_ADDRESS,
    NEXT_PUBLIC_INFLUENCE_CLOUDFRONT_IMAGE_HOST:
      process.env.NEXT_PUBLIC_INFLUENCE_CLOUDFRONT_IMAGE_HOST,
    NEXT_PUBLIC_CHAIN: process.env.NEXT_PUBLIC_CHAIN,
    NEXT_PUBLIC_ALCHEMY_API_KEY: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
  },
})
