import * as Sentry from 'sentry-expo'
import { Colors } from '@constants'
import { ScrollView, View } from 'react-native'
import AButtonWithLoader from '@atoms/AButtonWithLoader'
import ASafeAreaView from '@atoms/ASafeAreaView'
import MFormText from '@molecules/MFormText'
import MGeneralErrorDialog from '@molecules/MGeneralErrorDialog'
import React, { useEffect, useState } from 'react'

import {
  required,
  strongPasswordRegExRule,
  useAuth,
  useChangePasswordMutation,
} from 'shared'

import { useForm } from 'react-hook-form'
import { useScrollToTopOnError } from '@hooks'

export function ChangePasswordScreen({ navigation }) {
  const { logOut } = useAuth()
  const { mutate, isLoading, isError } = useChangePasswordMutation()

  const { control, errors, handleSubmit, setError } = useForm({
    defaultValues: {
      passwordCurrent: '',
      passwordNew: '',
      passwordConfirmation: '',
    },
  })

  const {
    scrollViewRef,
    renderErrorMessage,
    scrollToTopErrorHandler: onError,
  } = useScrollToTopOnError()

  const [generalErrorDialog, setGeneralErrorDialog] = useState(false)

  const onSubmit = async data => {
    if (data.passwordNew !== data.passwordConfirmation) {
      setError('passwordConfirmation', {
        type: 'manual',
        message: 'Passwords do not match',
      })
      return
    }

    delete data.passwordConfirmation

    await mutate(data, {
      onError: (error, variables) => {
        Sentry.Native.captureException(error, scope => {
          scope.setTransactionName('ChangePassword')
          scope.setContext('error', error)
          scope.setContext('variables', variables)
        })
      },
      onSuccess: () => {
        navigation.navigate('Today', {
          snackbar: 'The password has been changed',
        })
      },
    })
  }

  useEffect(() => {
    if (isError) {
      setGeneralErrorDialog(true)
    }
  }, [isError])

  return (
    <ASafeAreaView>
      <ScrollView
        style={{ backgroundColor: Colors.white, flex: 1 }}
        ref={scrollViewRef}
      >
        {renderErrorMessage()}
        <View style={{ paddingHorizontal: 16 }}>
          <MFormText
            label="Current password"
            name="passwordCurrent"
            secureTextEntry
            control={control}
            errors={errors}
            onSubmitEditing={handleSubmit(onSubmit)}
          />
          <MFormText
            label="New password"
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
          <View style={{ marginTop: 24 }}>
            <AButtonWithLoader
              loading={isLoading}
              disabled={isLoading}
              mode="contained"
              onPress={handleSubmit(onSubmit, onError)}
            >
              Change password
            </AButtonWithLoader>
          </View>
        </View>
      </ScrollView>
      <MGeneralErrorDialog
        visible={generalErrorDialog}
        onDismiss={() => setGeneralErrorDialog(false)}
      />
    </ASafeAreaView>
  )
}

export default ChangePasswordScreen
