import React, { useCallback, useRef, useState } from 'react'
import { View } from 'react-native'
import { Text } from 'react-native-paper'
import { Colors } from '@constants'

export const useScrollToTopOnError = (
  errorMessage = 'Please correct errors below'
) => {
  const scrollViewRef = useRef()
  const [errorsBelowMessage, setErrorsBelowMessage] = useState()

  const scrollToTopErrorHandler = useCallback(() => {
    scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: true })
    setErrorsBelowMessage(true)
  }, [])

  const renderErrorMessage = useCallback(() => {
    if (!errorsBelowMessage) {
      return null
    }

    return (
      <View style={{ padding: 16, paddingBottom: 4 }}>
        <Text style={{ color: Colors.red }}>{errorMessage}</Text>
      </View>
    )
  }, [errorMessage, errorsBelowMessage])

  return {
    scrollViewRef,
    scrollToTopErrorHandler,
    renderErrorMessage,
  }
}
