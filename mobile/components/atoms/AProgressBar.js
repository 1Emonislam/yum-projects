import React from 'react'
import { ProgressBar } from 'react-native-paper'
import { Colors } from '@constants'

const AProgressBar = ({ color = Colors.black, progress, ...props }) => (
  <ProgressBar color={color} progress={progress} {...props} />
)

export default AProgressBar
