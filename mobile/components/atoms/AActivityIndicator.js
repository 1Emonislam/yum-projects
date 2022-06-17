import React from 'react'

import { ActivityIndicator } from 'react-native-paper'

import { Colors } from '@constants'

const AActivityIndicator = ({ color = Colors.black, ...props }) => (
  <ActivityIndicator color={color} size={20} {...props} />
)

export default AActivityIndicator
