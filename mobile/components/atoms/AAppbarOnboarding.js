import React from 'react'
import { Image } from 'react-native'
import { Appbar } from 'react-native-paper'
import Constants from 'expo-constants'
import { Colors } from '@constants'

const AAppbarOnboarding = ({ navigation, previous }) => (
  <Appbar.Header
    style={{
      backgroundColor: Colors.white,
      marginTop: Constants.statusBarHeight,
      justifyContent: 'center',
      elevation: 0,
    }}
  >
    {previous && (
      <Appbar.BackAction
        color={Colors.black}
        onPress={navigation.goBack}
        style={{ position: 'absolute', top: 4, left: 4 }}
      />
    )}
    <Image
      style={{ width: 55, height: 20 }}
      source={require('./../../assets/yam.png')}
    />
  </Appbar.Header>
)

export default AAppbarOnboarding
