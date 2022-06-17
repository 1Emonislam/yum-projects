import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'

import AAppbarOnboarding from '@atoms/AAppbarOnboarding'
import SignInScreen from '@screens/SignInScreen'
import SignInCodeScreen from '@screens/SignInCodeScreen'
import SignInLocationScreen from '@screens/SignInLocationScreen'
import ResetPasswordScreen from '@screens/ResetPasswordScreen'

const { Navigator, Screen } = createStackNavigator()

const AuthStack = () => {
  return (
    <Navigator
      mode="modal"
      screenOptions={{
        header: AAppbarOnboarding,
      }}
    >
      <Screen name="Sign in" component={SignInScreen} />
      <Screen name="Sign in: Code" component={SignInCodeScreen} />
      <Screen name="Sign in: Location" component={SignInLocationScreen} />
      <Screen name="Reset password" component={ResetPasswordScreen} />
    </Navigator>
  )
}

export default AuthStack
