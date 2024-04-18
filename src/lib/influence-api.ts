import {
  makeInfluenceApi,
  preReleaseInfluenceApiUrl,
} from 'influence-typed-sdk'

export const influenceApi = makeInfluenceApi({
  baseUrl: preReleaseInfluenceApiUrl,
  accessToken: process.env.PRERELEASE_INFLUENCE_API_ACCESS_TOKEN ?? '',
})
