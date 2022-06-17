import { Button } from 'react-native-paper'
import { Colors } from '@constants'
import AActivityIndicator from './../atoms/AActivityIndicator'
import Constants from 'expo-constants'
import React from 'react'

const MAppVersion = ({
  forceCheckForUpdateInProgress = false,
  onForceCheckForUpdate = () => {},
}) => {
  return forceCheckForUpdateInProgress ? (
    <AActivityIndicator
      color={Colors.placeholder}
      size={16}
      style={{
        position: 'absolute',
        top: 17,
        right: 15,
        zIndex: 1,
      }}
    />
  ) : (
    <Button
      compact
      color={Colors.placeholder}
      uppercase={false}
      labelStyle={{ letterSpacing: 0, fontSize: 11 }}
      style={{
        color: Colors.placeholder,
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 1,
      }}
      onPress={onForceCheckForUpdate}
    >
      Version {Constants.manifest.version}
    </Button>
  )
}

export default MAppVersion
