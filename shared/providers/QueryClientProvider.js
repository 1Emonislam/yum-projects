import React, { useMemo } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { useAuth } from './AuthProvider'

export const QueryProvider = props => {
  const { logOut } = useAuth()
  const queryClient = useMemo(() => {
    return new QueryClient({
      defaultOptions: {
        queries: {
          onError: error => {
            if (
              error?.message === 'session expired' ||
              error?.response?.status === 401
            ) {
              logOut()
            }
          },
          retry: false,
          refetchOnWindowFocus: false,
        },
      },
    })
  }, [logOut])

  return <QueryClientProvider client={queryClient} {...props} />
}
