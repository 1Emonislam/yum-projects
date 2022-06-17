import React, { useEffect, useState } from 'react'
import { Keyboard } from 'react-native'
import { FAB } from 'react-native-paper'

const AFab = ({ isFocused, ...props }) => {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    Keyboard.addListener('keyboardDidShow', _keyboardDidShow)
    Keyboard.addListener('keyboardDidHide', _keyboardDidHide)

    return () => {
      Keyboard.removeListener('keyboardDidShow', _keyboardDidShow)
      Keyboard.removeListener('keyboardDidHide', _keyboardDidHide)
    }
  }, [])

  const _keyboardDidShow = () => {
    setVisible(false)
  }

  const _keyboardDidHide = () => {
    setVisible(true)
  }

  return (
    <FAB
      style={{ position: 'absolute', margin: 16, right: 0, bottom: 0 }}
      visible={isFocused && visible}
      {...props}
    />
  )
}

export default AFab
