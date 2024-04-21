import {
  makeInfluenceApi,
  preReleaseInfluenceApiUrl,
} from 'influence-typed-sdk'
import { env } from '@/env'

export const influenceApi = makeInfluenceApi({
  baseUrl: preReleaseInfluenceApiUrl,
  accessToken: env.PRERELEASE_INFLUENCE_API_ACCESS_TOKEN,
})
