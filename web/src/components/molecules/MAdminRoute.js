import React from 'react'
import { Route, Redirect, Switch } from 'react-router-dom'
import { useAuth } from 'shared'

export default function MAdminRoute({ children }) {
  const { isAdmin, isAuthenticated, isAuthPending, isAreaOrRegionalManager } = useAuth()

  if (isAuthPending) {
    return null
  }

  return isAuthenticated && (isAdmin || isAreaOrRegionalManager) ? <Switch>{children}</Switch> : <Route />
}
