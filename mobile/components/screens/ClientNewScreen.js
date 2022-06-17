import * as Sentry from 'sentry-expo'
import AButton from '@atoms/AButton'
import AHelperText from '@atoms/AHelperText'
import ARadio from '@atoms/ARadio'
import ARadioGroup from '@atoms/ARadioGroup'
import ASafeAreaView from '@atoms/ASafeAreaView'
import ATextInput from '@atoms/ATextInput'
import AActivityIndicator from '@atoms/AActivityIndicator'
import ATitle from '@atoms/ATitle'
import MError from '@molecules/MError'
import MGeneralErrorDialog from '@molecules/MGeneralErrorDialog'
import { Colors } from '@constants'
import React, { useEffect, useState } from 'react'
import { ScrollView, View } from 'react-native'
import {
  Caption,
  Checkbox,
  Divider,
  List,
  Paragraph,
  Text,
} from 'react-native-paper'
import { useQueryClient } from 'react-query'
import capitalize from 'lodash/capitalize'

import {
  normalizeFullName,
  useCreateClientMutation,
  useClientGroupsByLoanOfficerId,
  useUserProfile,
} from 'shared'

import { useForm, Controller } from 'react-hook-form'
import { useScrollToTopOnError } from '@hooks'

const required = 'This field is required' // TODO: Create shared dictionary

export function ClientNewScreen({ navigation }) {
  const queryClient = useQueryClient()

  const { _id: loanOfficerId } = useUserProfile()

  const { isLoading: isLoadingGroups, data: clientGroups = [] } =
    useClientGroupsByLoanOfficerId(loanOfficerId)

  const { mutate, isLoading, isError, isSuccess } = useCreateClientMutation()

  const { control, errors, handleSubmit, watch } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      admissionSmallLoan: false,
      admissionSmallBusinessLoan: false,
      passbook: false,
    },
  })

  const admissionSmallLoanValue = watch('admissionSmallLoan', false)
  const admissionSmallBusinessLoanValue = watch(
    'admissionSmallBusinessLoan',
    false
  )

  const {
    scrollViewRef,
    renderErrorMessage,
    scrollToTopErrorHandler: onError,
  } = useScrollToTopOnError()

  const [generalErrorDialog, setGeneralErrorDialog] = useState(false)

  const onSubmit = async data => {
    await mutate(
      {
        ...data,
        ...normalizeFullName(data),
      },
      {
        onError: (error, variables) => {
          Sentry.Native.captureException(error, scope => {
            scope.setTransactionName('ClientNew')
            scope.setContext('error', error)
            scope.setContext('variables', variables)
          })
        },
      }
    )
  }

  useEffect(() => {
    if (isError) {
      setGeneralErrorDialog(true)
    }
  }, [isError])

  useEffect(() => {
    if (isSuccess) {
      queryClient.invalidateQueries('clientsByStatusAndLoanOfficerId')

      navigation.goBack()
    }
  }, [isSuccess, navigation])

  return (
    <ASafeAreaView>
      <ScrollView
        style={{ backgroundColor: Colors.white, flex: 1 }}
        ref={scrollViewRef}
      >
        {renderErrorMessage()}
        <View style={{ padding: 16, paddingBottom: 0 }}>
          <ATitle>Basic information</ATitle>
        </View>
        <View style={{ padding: 16, paddingBottom: 0 }}>
          <Text>First name:</Text>
          <Controller
            control={control}
            render={({ onChange, onBlur, value }) => (
              <ATextInput
                autoFocus
                error={errors.firstName ? true : false}
                onChangeText={value => onChange(value)}
                onBlur={onBlur}
                value={value}
              />
            )}
            name="firstName"
            rules={{ required: { value: true, message: required } }}
          />
          <MError errors={errors} name="firstName" />
        </View>
        <View style={{ padding: 16, paddingBottom: 0 }}>
          <Text>Last name:</Text>
          <Controller
            control={control}
            render={({ onChange, onBlur, value }) => (
              <ATextInput
                error={errors.lastName ? true : false}
                onChangeText={value => onChange(value)}
                onBlur={onBlur}
                value={value}
              />
            )}
            name="lastName"
            rules={{ required: { value: true, message: required } }}
          />
          <MError errors={errors} name="lastName" />
        </View>
        <View style={{ padding: 16, paddingBottom: 0 }}>
          <Text>Group:</Text>
        </View>
        {isLoadingGroups && (
          <View style={{ padding: 16, paddingTop: 12 }}>
            <AActivityIndicator />
          </View>
        )}
        {!isLoadingGroups && clientGroups.length === 0 && (
          <View style={{ padding: 16, paddingTop: 0 }}>
            <Paragraph style={{ color: Colors.placeholder }}>
              You have no groups. Please go back to the previous screen and add
              a group first.
            </Paragraph>
          </View>
        )}
        {!isLoadingGroups && clientGroups.length > 0 && (
          <View style={{ marginLeft: -8, paddingBottom: 16, paddingTop: 12 }}>
            <Controller
              control={control}
              render={({ onChange, value }) => (
                <ARadioGroup
                  onValueChange={value => onChange(value)}
                  value={value}
                >
                  {clientGroups.map(group => (
                    <ARadio key={group._id} value={group._id}>
                      {group.name}
                    </ARadio>
                  ))}
                </ARadioGroup>
              )}
              name="group"
              defaultValue={clientGroups[0]._id}
            />
          </View>
        )}
        <Divider />
        <View style={{ padding: 16, paddingBottom: 0 }}>
          <ATitle>For admission</ATitle>
        </View>
        <View style={{ padding: 16, paddingBottom: 0 }}>
          <Text>Address:</Text>
          <Controller
            control={control}
            render={({ onChange, onBlur, value }) => (
              <ATextInput
                multiline
                numberOfLines={1}
                error={errors.address ? true : false}
                onChangeText={value => onChange(value)}
                onBlur={onBlur}
                value={value}
              />
            )}
            name="address"
            rules={{ required: { value: true, message: required } }}
            defaultValue=""
          />
          <MError errors={errors} name="address" />
        </View>
        <View style={{ padding: 16 }}>
          <Text>Notes:</Text>
          <Controller
            control={control}
            render={({ onChange, onBlur, value }) => (
              <ATextInput
                multiline
                numberOfLines={1}
                error={errors.notes ? true : false}
                onChangeText={value => onChange(value)}
                onBlur={onBlur}
                value={value}
              />
            )}
            name="notes"
            defaultValue=""
          />
          <MError errors={errors} name="notes" />
        </View>
        <Divider />
        <View style={{ padding: 16, paddingBottom: 0 }}>
          <ATitle>Passbook</ATitle>
        </View>
        <View style={{ padding: 16 }}>
          <Text>Identifier:</Text>
          <Controller
            control={control}
            render={({ onChange, onBlur, value }) => (
              <ATextInput
                error={errors.passbookIdentifier ? true : false}
                onChangeText={value => onChange(value)}
                onBlur={onBlur}
                value={value}
              />
            )}
            name="passbookIdentifier"
            rules={{ required: { value: true, message: required } }}
            defaultValue=""
          />
          <MError errors={errors} name="passbookIdentifier" />
        </View>
        <Divider />
        <View style={{ padding: 16, paddingBottom: 8 }}>
          <ATitle>Fees</ATitle>
          <Caption>Mark the fees paid by the client</Caption>
        </View>
        {(errors.admissionSmallLoan ||
          errors.admissionSmallBusinessLoan ||
          errors.passbook) && (
          <View style={{ paddingHorizontal: 16 }}>
            <AHelperText error>
              The client has to pay passbook and one admission fee
            </AHelperText>
          </View>
        )}
        <View style={{ paddingBottom: 16 }}>
          <Controller
            control={control}
            render={({ onChange, onBlur, value }) => (
              <List.Item
                title="Admission (Small Business Loan)"
                description="USh 4,000"
                left={() => (
                  <Checkbox
                    status={value ? 'checked' : 'unchecked'}
                    color={Colors.green}
                    onBlur={onBlur}
                  />
                )}
                onPress={() => onChange(!value)}
              />
            )}
            name="admissionSmallBusinessLoan"
            rules={{
              validate: value =>
                admissionSmallLoanValue === true
                  ? true
                  : value === true
                  ? true
                  : false,
            }}
          />
          <Controller
            control={control}
            render={({ onChange, onBlur, value }) => (
              <List.Item
                title="Admission (Small Loan, Monthly Loan)"
                description="USh 2,000"
                left={() => (
                  <Checkbox
                    status={value ? 'checked' : 'unchecked'}
                    color={Colors.green}
                    onBlur={onBlur}
                  />
                )}
                onPress={() => onChange(!value)}
              />
            )}
            name="admissionSmallLoan"
            rules={{
              validate: value =>
                admissionSmallBusinessLoanValue === true
                  ? true
                  : value === true
                  ? true
                  : false,
            }}
          />
          <Controller
            control={control}
            render={({ onChange, onBlur, value }) => (
              <List.Item
                title="Passbook"
                description="USh 2,000"
                left={() => (
                  <Checkbox
                    status={value ? 'checked' : 'unchecked'}
                    color={Colors.green}
                    onBlur={onBlur}
                  />
                )}
                onPress={() => onChange(!value)}
              />
            )}
            name="passbook"
            rules={{ required: true }}
          />
        </View>
        <Divider />
        <View style={{ padding: 16 }}>
          {isLoading && (
            <View style={{ padding: 8 }}>
              <AActivityIndicator />
            </View>
          )}
          {!isLoading && (
            <AButton mode="contained" onPress={handleSubmit(onSubmit, onError)}>
              Save
            </AButton>
          )}
        </View>
      </ScrollView>
      <MGeneralErrorDialog
        visible={generalErrorDialog}
        onDismiss={() => setGeneralErrorDialog(false)}
      />
    </ASafeAreaView>
  )
}

export default ClientNewScreen
