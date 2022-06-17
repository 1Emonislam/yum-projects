import React from 'react'
import { RadioButton } from 'react-native-paper'
import { Colors } from '@constants'

const ARadio = ({ children, ...props }) => (
  <RadioButton.Item
    label={children}
    style={{ flexDirection: 'row-reverse' }}
    color={Colors.green}
    labelStyle={{ color: Colors.black, fontSize: 14, flexGrow: 1 }}
    {...props}
  />
)

export default ARadio
