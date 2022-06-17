import { useLayoutEffect } from 'react'
import { useNavigation } from '@react-navigation/core'

export const useHeader = (options = {}) => {
  const navigation = useNavigation()

  useLayoutEffect(() => {
    navigation.setOptions(options)
  }, [navigation, options])
}
