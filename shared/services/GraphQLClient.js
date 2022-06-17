import { GraphQLClient } from 'graphql-request'
import { getTokens, refreshToken } from './AuthService'
import { currentRealmApp } from 'shared/yamrc'

const setAuthorizationHeader = async options => {
  const tokens = await getTokens()
  const access_token = tokens?.access_token ?? null
  options.headers.Authorization = access_token ? `Bearer ${access_token}` : null

  return options
}

export const graphQLClient = new GraphQLClient(
  `${currentRealmApp.apiUrl}/graphql`,
  {
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    },
    fetch: async (uri, options) => {
      const response = await fetch(uri, await setAuthorizationHeader(options))
      if (response.status !== 401) {
        return response
      }
      await refreshToken()
      return fetch(uri, await setAuthorizationHeader(options))
    },
  }
)
