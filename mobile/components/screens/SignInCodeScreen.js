import { Colors } from '@constants'
import { useAuth } from 'shared'
import { useForm } from 'react-hook-form'
import { View } from 'react-native'
import AButtonWithLoader from '@atoms/AButtonWithLoader'
import ASafeAreaView from '@atoms/ASafeAreaView'
// import ATitle from '@atoms/ATitle'
import MFormText from '@molecules/MFormText'
import React, { useState } from 'react'

export function SignInCodeScreen({ navigation, route }) {
  const { logIn, requestPasswordReset } = useAuth()

  const [loading, setLoading] = useState(false)
  const [requestingNewPassword, setRequestingNewPassword] = useState(false)

  const { control, errors, handleSubmit, setError } = useForm({
    defaultValues: {
      code:
        route.params.phoneNumber === '+2561101'
          ? ''
          : route.params.phoneNumber === '+2561102'
          ? ''
          : route.params.phoneNumber === '+2561103'
          ? ''
          : route.params.phoneNumber === '+2561104'
          ? ''
          : '',
    },
  })

  const onSubmit = async data => {
    setLoading(true)

    try {
      await logIn(route?.params?.phoneNumber, data.code)

      // This causes a React warning about updating state of an unmounted component
      // It's because we're instantly removing the Auth nav stack once user is authed
      // Given that, clearing the loading state is not necessary in this case
      // Keeping it for further reference
      // setLoading(false)
    } catch (error) {
      setLoading(false)

      setError('code', {
        type: 'manual',
        message: 'Please provide a valid password',
      })
    }
  }

  const onRequestPasswordReset = async () => {
    setRequestingNewPassword(true)

    try {
      await requestPasswordReset(route?.params?.phoneNumber)

      setRequestingNewPassword(false)
      navigation.navigate('Reset password', {
        phoneNumber: route?.params?.phoneNumber,
      })
    } catch (error) {
      setRequestingNewPassword(false)

      setError('code', {
        type: 'manual',
        message:
          'There was a problem while resetting password. Please try again',
      })
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
        <View style={{ padding: 20, paddingTop: 140 }}>
          <View style={{ paddingBottom: 16 }}>
            <MFormText
              label="Password"
              name="code"
              secureTextEntry
              control={control}
              errors={errors}
              helperText={errors.code ? undefined : ' '}
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
            Sign in
          </AButtonWithLoader>

          <AButtonWithLoader
            loading={requestingNewPassword}
            style={{ marginBottom: 16 }}
            mode="text"
            onPress={onRequestPasswordReset}
          >
            I forgot my password
          </AButtonWithLoader>
        </View>
      </View>
    </ASafeAreaView>
  )
}

export default SignInCodeScreen
