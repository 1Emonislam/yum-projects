import { Colors } from '@constants'
import { required, strongPasswordRegExRule, useAuth } from 'shared'
import { useForm } from 'react-hook-form'
import { View, ScrollView } from 'react-native'
import { Paragraph } from 'react-native-paper'
import AButtonWithLoader from '@atoms/AButtonWithLoader'
import MGeneralErrorDialog from '@molecules/MGeneralErrorDialog'
import ASafeAreaView from '@atoms/ASafeAreaView'
import ATitle from '@atoms/ATitle'
import MFormText from '@molecules/MFormText'
import React, { useState } from 'react'

export function ResetPasswordScreen({ route }) {
  const { resetPassword, logIn } = useAuth()
  const phoneNumber = route?.params?.phoneNumber

  const [loading, setLoading] = useState(false)
  const [hasApiError, setHasApiError] = useState(false)

  const { control, errors, handleSubmit, setError } = useForm()

  const onSubmit = async data => {
    if (data.passwordNew !== data.passwordConfirmation) {
      setError('passwordConfirmation', {
        type: 'manual',
        message: 'Passwords do not match',
      })
      return
    }

    setLoading(true)

    try {
      const apiResponse = await resetPassword(
        phoneNumber,
        data.passwordNew,
        data.code
      )

      const { data: result } = apiResponse

      if (result.success) {
        await logIn(phoneNumber, data.passwordNew)

        return
      }

      setLoading(false)

      setError('code', {
        type: 'manual',
        message: 'Please provide a valid SMS code',
      })
    } catch (error) {
      setLoading(false)
      setHasApiError(true)
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
            <ATitle style={{ paddingBottom: 24 }}>Reset password</ATitle>
            <Paragraph style={{ paddingBottom: 8 }}>
              Enter the code we have sent to {phoneNumber} and type in a new
              password.
            </Paragraph>
            <MFormText
              label="SMS code"
              name="code"
              secureTextEntry
              control={control}
              errors={errors}
              keyboardType="numeric"
              onSubmitEditing={handleSubmit(onSubmit)}
              autoFocus
            />
            <MFormText
              label="Password"
              name="passwordNew"
              secureTextEntry
              control={control}
              errors={errors}
              onSubmitEditing={handleSubmit(onSubmit)}
              rules={{
                ...strongPasswordRegExRule,
                required: { value: true, message: required },
              }}
            />
            <MFormText
              label="Confirm password"
              name="passwordConfirmation"
              secureTextEntry
              control={control}
              errors={errors}
              onSubmitEditing={handleSubmit(onSubmit)}
            />
          </View>
          <AButtonWithLoader
            loading={loading}
            disabled={loading}
            style={{ marginBottom: 16 }}
            mode="contained"
            onPress={handleSubmit(onSubmit)}
          >
            Reset password
          </AButtonWithLoader>
        </View>
      </ScrollView>
      <MGeneralErrorDialog
        visible={hasApiError}
        onDismiss={() => setHasApiError(false)}
      />
    </ASafeAreaView>
  )
}

export default ResetPasswordScreen
