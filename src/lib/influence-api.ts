import {
  influenceApiUrl,
  makeInfluenceApi,
  preReleaseInfluenceApiUrl,
} from 'influence-typed-sdk/api'
import { env } from '@/env'

export const influenceApi = makeInfluenceApi({
  baseUrl:
    env.NEXT_PUBLIC_CHAIN === 'mainnet'
      ? influenceApiUrl
      : preReleaseInfluenceApiUrl,
  accessToken: env.INFLUENCE_API_ACCESS_TOKEN,
})
