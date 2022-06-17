import React, { useEffect, useState } from 'react'
import { Keyboard } from 'react-native'
import { FAB, Portal } from 'react-native-paper'
import { Colors, theme } from '@constants'

const AFabGroup = ({ isFocused, ...props }) => {
  const [visible, setVisible] = useState(true)
  const [open, setOpen] = useState(false)

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
    <Portal>
      <FAB.Group
        theme={{
          ...theme,
          colors: {
            ...theme.colors,
            placeholder: Colors.black,
          },
        }}
        open={open}
        visible={isFocused && visible}
        onStateChange={() => setOpen(!open)}
        {...props}
      />
    </Portal>
  )
}

export default AFabGroup
