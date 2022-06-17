import { Colors } from '@constants'
import { Paragraph, Text } from 'react-native-paper'
import { ScrollView, View } from 'react-native'
import { useAuth } from 'shared'
import { useForm } from 'react-hook-form'
import AButtonWithLoader from '@atoms/AButtonWithLoader'
import ASafeAreaView from '@atoms/ASafeAreaView'
import ATitle from '@atoms/ATitle'
import MFormText from '@molecules/MFormText'
import parsePhoneNumber from 'libphonenumber-js'
import React, { useState } from 'react'
import Constants from 'expo-constants'

export function SignInScreen({ navigation }) {
  const { initLogIn } = useAuth()

  const [loading, setLoading] = useState(false)

  const { control, errors, setError, handleSubmit } = useForm()

  const onSubmit = async data => {
    const phoneNumber = parsePhoneNumber(data.phoneNumber)

    if (!phoneNumber) {
      return setError('phoneNumber', {
        type: 'manual',
        message: 'Invalid phone number format',
      })
    }

    setLoading(true)

    try {
      await initLogIn(phoneNumber.number, 'mobile')

      setLoading(false)

      navigation.navigate('Sign in: Code', {
        phoneNumber: phoneNumber.number,
      })
    } catch (error) {
      setLoading(false)

      let message

      switch (error?.response?.data?.message?.toLowerCase()) {
        case 'user not found':
          message = 'Invalid phone number'
          break
        case 'admin':
          message = 'As an admin, please sign in at app.yamafrica.com'
          break
        default:
          message = 'Error occurred, try again'
      }

      setError('phoneNumber', {
        type: 'manual',
        message,
      })
    }
  }

  return (
    <ASafeAreaView>
      <ScrollView
        keyboardShouldPersistTaps={'handled'}
        contentContainerStyle={{
          backgroundColor: Colors.white,
          display: 'flex',
          flexGrow: 1,
        }}
      >
        <View style={{ padding: 20, paddingTop: 16, flexGrow: 1 }}>
          <View style={{ paddingBottom: 16 }}>
            <ATitle style={{ paddingBottom: 24 }}>Welcome</ATitle>
            <Paragraph style={{ paddingBottom: 8 }}>
              Yam is your daily companion app – a personal assistant in your
              pocket. Use your phone number to connect to your branch.
            </Paragraph>
            <MFormText
              label="Your phone number"
              name="phoneNumber"
              control={control}
              errors={errors}
              defaultValue="+256"
              helperText={errors.phoneNumber ? undefined : ' '}
              onSubmitEditing={handleSubmit(onSubmit)}
              autoFocus
            />
          </View>
          <AButtonWithLoader
            loading={loading}
            style={{ marginBottom: 16 }}
            mode="contained"
            onPress={handleSubmit(onSubmit)}
          >
            Continue
          </AButtonWithLoader>
        </View>
        <View style={{ padding: 20 }}>
          <Text style={{ color: Colors.placeholder, textAlign: 'right' }}>
            Version {Constants.manifest.version} @{' '}
            {Constants.manifest.extra.realmAppId}
          </Text>
        </View>
      </ScrollView>
    </ASafeAreaView>
  )
}

export default SignInScreen
