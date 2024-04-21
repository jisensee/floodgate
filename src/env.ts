import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    PRERELEASE_INFLUENCE_API_ACCESS_TOKEN: z.string().startsWith('ey'),
  },
  client: {
    NEXT_PUBLIC_CONTRACT_ADDRESS: z.string().startsWith('0x'),
    NEXT_PUBLIC_INFLUENCE_CLOUDFRONT_IMAGE_HOST: z.string().min(1),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    NEXT_PUBLIC_INFLUENCE_CLOUDFRONT_IMAGE_HOST:
      process.env.NEXT_PUBLIC_INFLUENCE_CLOUDFRONT_IMAGE_HOST,
  },
})
