import React from 'react'
import { SafeAreaView } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { Colors } from '@constants'

const ASafeAreaView = ({ children, style = [], ...props }) => (
  <SafeAreaView
    style={{ flex: 1, background: Colors.white, ...style }}
    {...props}
  >
    <StatusBar style="dark" />
    {children}
  </SafeAreaView>
)

export default ASafeAreaView
