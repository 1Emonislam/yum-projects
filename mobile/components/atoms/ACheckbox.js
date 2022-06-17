import React from 'react'
import { Checkbox } from 'react-native-paper'
import { Colors } from '@constants'

const ACheckbox = ({ children, ...props }) => (
  <Checkbox.Item
    label={children}
    style={{ flexDirection: 'row-reverse' }}
    labelStyle={{ color: Colors.black, fontSize: 14, flexGrow: 1 }}
    rippleColor={Colors.orangeBackground}
    {...props}
  />
)

export default ACheckbox
