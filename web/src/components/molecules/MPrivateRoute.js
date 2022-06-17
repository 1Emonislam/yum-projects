import React from 'react'
import { Route, Redirect, Switch } from 'react-router-dom'
import { useAuth } from 'shared'

export default function MPrivateRoute({ children, ...rest }) {
  const { isAuthenticated, isAuthPending } = useAuth()

  if (isAuthPending) {
    return null
  }

  return isAuthenticated ? (
    <Switch>{children}</Switch>
  ) : (
    <Route
      {...rest}
      render={({ location }) => (
        <Redirect
          to={{
            pathname: '/',
            state: { from: location },
          }}
        />
      )}
    />
  )
}
