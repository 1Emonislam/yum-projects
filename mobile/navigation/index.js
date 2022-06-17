import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import AuthStack from './AuthStack'
import RootStack from './RootStack'
import { useAuth } from 'shared'

export default () => {
  const { isAuthenticated } = useAuth()

  return (
    <NavigationContainer>
      {isAuthenticated ? <RootStack /> : <AuthStack />}
    </NavigationContainer>
  )
}
