import React from 'react'
import { View } from 'react-native'
import AActivityIndicator from './AActivityIndicator'
import AButton from './AButton'

const AButtonWithLoader = ({ loading = false, ...buttonProps }) => {
  if (loading) {
    return (
      <View style={{ padding: 8 }}>
        <AActivityIndicator />
      </View>
    )
  }

  return <AButton {...buttonProps} />
}

export default AButtonWithLoader
