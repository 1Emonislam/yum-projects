import React from 'react'
import { RadioButton } from 'react-native-paper'

const ARadioGroup = ({ children, ...props }) => (
  <RadioButton.Group {...props}>{children}</RadioButton.Group>
)

export default ARadioGroup
