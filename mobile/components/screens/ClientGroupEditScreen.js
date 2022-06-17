import { Colors } from '@constants'
import { Divider, List } from 'react-native-paper'
import { required, useClientGroupEditForm } from 'shared'
import { ScrollView, View } from 'react-native'
import { useHeader, useScrollToTopOnError } from '@hooks'
import AButtonWithLoader from '@atoms/AButtonWithLoader'
import ASafeAreaView from '@atoms/ASafeAreaView'
import ATitle from '@atoms/ATitle'
import MFormRadioGroup from '../molecules/MFormRadioGroup'
import MFormRole from '@molecules/MFormRole'
import MFormText from '@molecules/MFormText'
import moment from 'moment-timezone'
import React, { useEffect } from 'react'

export function ClientGroupEditScreen({ navigation, route }) {
  const clientGroupId = route?.params?.clientGroupId

  const {
    scrollViewRef,
    scrollToTopErrorHandler: onError,
    renderErrorMessage,
  } = useScrollToTopOnError()

  const {
    clientGroup,
    control,
    errors,
    getValues,
    isFetching,
    isSubmitting,
    setValue,
    submit,
  } = useClientGroupEditForm(clientGroupId, {
    onSuccess: () => navigation.goBack(),
    onError,
  })

  useEffect(() => {
    const clearFieldsAlreadyUsingClientId = clientId => {
      const roles = ['president', 'secretary', 'cashier']

      roles.forEach(role => {
        const roleId = getValues(`${role}Id`)

        if (roleId === clientId) {
          // @FIXME: figure out how to unset a field value with the current event sourcing architecture
          setValue(`${role}Id`, '000000000000000000000000')
          setValue(`${role}Name`, undefined)
        }
      })
    }

    if (route.params) {
      const { clientRole } = route.params

      if (clientRole) {
        clearFieldsAlreadyUsingClientId(clientRole.clientId)

        setValue(`${clientRole.name}Id`, clientRole.clientId)
        setValue(`${clientRole.name}Name`, clientRole.clientName)
      }
    }
  }, [getValues, route.params, setValue])

  useHeader({
    title: isFetching ? 'Loading…' : 'Edit group',
    // actions: (
    //   <Appbar.Action color={Colors.black} icon="delete" onPress={() => {}} />
    // ),
  })

  return (
    <ASafeAreaView>
      {!isFetching && (
        <ScrollView
          ref={scrollViewRef}
          style={{ backgroundColor: Colors.white, flex: 1 }}
        >
          {renderErrorMessage()}
          <View style={{ padding: 16 }}>
            <ATitle>Basic information</ATitle>
            <MFormText
              label="Name"
              name="name"
              control={control}
              errors={errors}
            />
            <MFormText
              label="Code"
              name="code"
              control={control}
              errors={errors}
            />
          </View>
          <Divider />
          <View style={{ padding: 16 }}>
            <ATitle>Meetings</ATitle>
            <MFormText
              label="Address"
              name="meeting.address"
              control={control}
              errors={errors}
              multiline
              numberOfLines={1}
            />
            <MFormText
              label="Time"
              name="meeting.time"
              control={control}
              errors={errors}
              helperText="H:MM"
              rules={{
                pattern: {
                  value: /[0-9]{1,2}:[0-9]{2}/,
                  message: 'Please enter the time in H:MM format',
                },
                validate: value =>
                  moment(
                    '1970-01-01 ' + value,
                    'YYYY-MM-DD H:mm',
                    true
                  ).isValid() || 'Please enter valid time in H:MM format',
                required: { value: true, message: required },
              }}
              defaultValue=""
            />
            {/* <MFormRadioGroup
              label="Day"
              name="meeting.dayOfWeek"
              items={[
                { value: 1, label: 'Monday' },
                { value: 2, label: 'Tuesday' },
                { value: 3, label: 'Wednesday' },
                { value: 4, label: 'Thursday' },
                { value: 5, label: 'Friday' },
                { value: 6, label: 'Saturday' },
                { value: 7, label: 'Sunday' },
              ]}
              control={control}
              errors={errors}
            /> */}
          </View>
          <Divider />
          <View style={{ padding: 16, paddingBottom: 0 }}>
            <ATitle>Roles</ATitle>
          </View>
          <List.Section>
            <MFormRole
              clientGroup={clientGroup}
              control={control}
              navigation={navigation}
              role="president"
            />
            <MFormRole
              clientGroup={clientGroup}
              control={control}
              navigation={navigation}
              role="secretary"
            />
            <MFormRole
              clientGroup={clientGroup}
              control={control}
              navigation={navigation}
              role="cashier"
            />
          </List.Section>
          <Divider />
          <View style={{ padding: 16 }}>
            <AButtonWithLoader
              mode="contained"
              onPress={submit}
              loading={isSubmitting}
            >
              Save
            </AButtonWithLoader>
          </View>
        </ScrollView>
      )}
    </ASafeAreaView>
  )
}

export default ClientGroupEditScreen
