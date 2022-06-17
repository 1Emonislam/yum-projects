import React from 'react'
import { Text } from 'react-native-paper'
import { Colors } from '@constants'

const ATitle = ({ children, style = [], ...props }) => (
  <Text
    style={{
      color: Colors.black,
      fontSize: 24,
      fontFamily: 'AbhayaLibre_700Bold',
      ...style,
    }}
    {...props}
  >
    {children}
  </Text>
)

export default ATitle
