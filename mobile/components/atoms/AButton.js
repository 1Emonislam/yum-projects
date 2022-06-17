import React from 'react'
import { Button } from 'react-native-paper'

const AButton = props => (
  <Button uppercase={false} labelStyle={{ letterSpacing: 0 }} {...props} />
)

export default AButton
