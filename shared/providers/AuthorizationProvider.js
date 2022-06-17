import React, { createContext, useContext } from 'react'
import { createContextualCan, useAbility } from '@casl/react'
import { subject } from '@casl/ability'
import { useAuth } from './AuthProvider'
const { defineAbilityFor } = require('../utils/defineAbility')

export const AuthorizationContext = createContext()

const { Provider } = AuthorizationContext

export const AuthorizationProvider = props => {
  const user = useAuth()
  const ability = defineAbilityFor(user)

  return <Provider {...props} value={ability} />
}

export const Can = createContextualCan(AuthorizationContext.Consumer)

/**
 * When you want to update user permissions (don't use update method, it won't
 * trigger re-rendering in this case) or you need to force re-render the whole app.
 */
export const useAuthorization = () => useContext(AuthorizationContext)

/**
 * This triggers re-render in the component where you use this hook when you update Ability rules.
 */
export const useAuthorizationWithRerendering = () => {
  const ability = useAbility(AuthorizationContext)

  return ability
}

export const subjectAlias = subject
