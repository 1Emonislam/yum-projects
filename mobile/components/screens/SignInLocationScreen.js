import React, { useState } from 'react'
import { View } from 'react-native'
import { Paragraph } from 'react-native-paper'
import * as Permissions from 'expo-permissions'
import ASafeAreaView from '@atoms/ASafeAreaView'
import AButton from '@atoms/AButton'
import ATitle from '@atoms/ATitle'
import { Colors } from '@constants'

export function SignInLocationScreen({ navigation }) {
  const [value, setValue] = useState()

  const getLocationAsync = async () => {
    const { status, permissions } = await Permissions.askAsync(
      Permissions.LOCATION
    )
    if (status === 'granted') {
      // return Location.getCurrentPositionAsync({ enableHighAccuracy: true });
      navigation.navigate('Main')
    } else {
      console.log('Location permission not granted')
    }
  }

  return (
    <ASafeAreaView>
      <View
        style={{
          backgroundColor: Colors.white,
          display: 'flex',
          flexGrow: 1,
        }}
      >
        <View style={{ padding: 20, paddingTop: 16 }}>
          <View style={{ paddingBottom: 16 }}>
            <ATitle style={{ paddingBottom: 24 }}>Use your location</ATitle>
            <Paragraph
              style={{ fontFamily: 'sans-serif-medium', marginBottom: 16 }}
            >
              To make Yam compliant with the Umoja policies, allow Yam to use
              your location.
            </Paragraph>
            <Paragraph style={{ marginBottom: 16 }}>
              Yam will use location for audit trails and to make it easier for
              you and your co–workers to find meeting places.
            </Paragraph>

            <Paragraph style={{ marginBottom: 8 }}>
              You can’t use Yam without sharing your location.
            </Paragraph>
          </View>
          <AButton
            style={{ marginBottom: 16 }}
            mode="contained"
            onPress={() => getLocationAsync()}
          >
            Turn on location
          </AButton>
        </View>
      </View>
    </ASafeAreaView>
  )
}

export default SignInLocationScreen
