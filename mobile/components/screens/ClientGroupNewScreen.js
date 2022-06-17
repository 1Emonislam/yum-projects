import { Colors } from '@constants'
import { Divider, Text, Portal, TouchableRipple } from 'react-native-paper'
import { required, timezone, useCreateClientGroupMutation } from 'shared'
import { ScrollView, View } from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { useQueryClient } from 'react-query'
import { useScrollToTopOnError } from '@hooks'
import AActivityIndicator from '@atoms/AActivityIndicator'
import AButton from '@atoms/AButton'
import AHelperText from '@atoms/AHelperText'
import ARadio from '@atoms/ARadio'
import ARadioGroup from '@atoms/ARadioGroup'
import ASafeAreaView from '@atoms/ASafeAreaView'
import ATextInput from '@atoms/ATextInput'
import ATitle from '@atoms/ATitle'
import DateTimePicker from '@react-native-community/datetimepicker'
import MError from '@molecules/MError'
import MGeneralErrorDialog from '@molecules/MGeneralErrorDialog'
import moment from 'moment-timezone'
import React, { useCallback, useEffect, useState } from 'react'

export function ClientGroupEditScreen({ navigation }) {
  const queryClient = useQueryClient()
  const { mutate, isLoading, isError } = useCreateClientGroupMutation()

  const { control, errors, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      frequency: 'weekly',
      dayOfWeek: 1,
      startedAt: '',
    },
  })

  const frequency = watch('frequency')
  const dayOfWeek = watch('dayOfWeek')

  const {
    scrollViewRef,
    renderErrorMessage,
    scrollToTopErrorHandler: onError,
  } = useScrollToTopOnError()

  const [generalErrorDialog, setGeneralErrorDialog] = useState(false)
  const [datePicker, setDatePicker] = useState(false)
  const [startedAt, setStartedAt] = useState(new Date())
  const [startedAtDefined, setStartedAtDefined] = useState(false)

  const onSubmit = useCallback(
    async data => {
      await mutate(data, {
        onSuccess: () => {
          queryClient.invalidateQueries('clientGroups')
          navigation.navigate('Clients')
        },
      })
    },
    [mutate, navigation, queryClient]
  )

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
        <View style={{ padding: 16 }}>
          <ATitle>Basic information</ATitle>
          <View style={{ paddingTop: 16, paddingBottom: 0 }}>
            <Text>Name:</Text>
            <Controller
              control={control}
              render={({ onChange, onBlur, value }) => (
                <ATextInput
                  autoFocus
                  error={errors.name ? true : false}
                  onChangeText={value => onChange(value)}
                  onBlur={onBlur}
                  value={value}
                />
              )}
              name="name"
              rules={{ required: { value: true, message: required } }}
              defaultValue=""
            />
            <MError errors={errors} name="name" />
          </View>
        </View>
        <Divider />
        <View style={{ padding: 16 }}>
          <ATitle>Meetings</ATitle>
          <View style={{ paddingTop: 16 }}>
            <Text>Address:</Text>
            <Controller
              control={control}
              render={({ onChange, onBlur, value }) => (
                <ATextInput
                  error={errors.address ? true : false}
                  onChangeText={value => onChange(value)}
                  onBlur={onBlur}
                  value={value}
                  multiline
                  numberOfLines={1}
                />
              )}
              name="address"
              rules={{ required: { value: true, message: required } }}
              defaultValue=""
            />
            <MError errors={errors} name="address" />
          </View>
          <View style={{ paddingTop: 16 }}>
            <Text>Time:</Text>
            <Controller
              control={control}
              render={({ onChange, onBlur, value }) => (
                <ATextInput
                  error={errors.time ? true : false}
                  onChangeText={value => onChange(value)}
                  onBlur={onBlur}
                  value={value}
                />
              )}
              name="time"
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
            {errors.time && <MError errors={errors} name="time" />}
            {!errors.time && <AHelperText>H:MM</AHelperText>}
          </View>
          <View style={{ paddingTop: 16 }}>
            <Text style={{ paddingBottom: 12 }}>Frequency:</Text>
            <View style={{ marginLeft: -24, marginRight: -16 }}>
              <Controller
                control={control}
                render={({ onChange, value }) => (
                  <ARadioGroup
                    onValueChange={value => onChange(value)}
                    value={value}
                  >
                    <ARadio value="weekly">Weekly</ARadio>
                    <ARadio value="biweekly">Biweekly</ARadio>
                    <ARadio value="monthly">Monthly</ARadio>
                  </ARadioGroup>
                )}
                name="frequency"
              />
            </View>
          </View>
          {frequency !== 'biweekly' && (
            <View style={{ paddingTop: 16 }}>
              <Text style={{ paddingBottom: 12 }}>Day:</Text>
              <AHelperText>
                Every {frequency === 'monthly' ? 'first ' : ''}
                {frequency === 'biweekly' ? 'other ' : ''}
                {moment.weekdays(dayOfWeek)}
                {frequency === 'monthly' ? ' of the month' : ''}
              </AHelperText>
              <View style={{ marginLeft: -24, marginRight: -16 }}>
                <Controller
                  control={control}
                  render={({ onChange, value }) => (
                    <ARadioGroup
                      onValueChange={value => onChange(value)}
                      value={value}
                    >
                      {[...Array(5).keys()].map(i => {
                        const weekday = i + 1

                        return (
                          <ARadio key={weekday} value={weekday}>
                            {moment.weekdays(weekday)}
                          </ARadio>
                        )
                      })}
                    </ARadioGroup>
                  )}
                  name="dayOfWeek"
                />
              </View>
            </View>
          )}
          {frequency === 'biweekly' && (
            <View style={{ paddingTop: 16 }}>
              <Text>Starting:</Text>
              <Controller
                control={control}
                render={() => (
                  <View style={{ position: 'relative' }}>
                    <ATextInput
                      error={errors.startedAt ? true : false}
                      placeholder="Tap to select"
                      value={
                        startedAtDefined
                          ? moment(startedAt).format('DD/MM/YYYY').toString()
                          : ''
                      }
                    />
                    <View
                      style={{
                        position: 'absolute',
                        top: 6,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 1,
                      }}
                    >
                      <TouchableRipple onPress={() => setDatePicker(true)}>
                        <View
                          style={{
                            height: 41,
                            width: '100%',
                            background: 'red',
                          }}
                        ></View>
                      </TouchableRipple>
                    </View>
                  </View>
                )}
                name="startedAt"
                rules={{
                  required: {
                    value: true,
                    message: required,
                  },
                }}
              />
              <MError errors={errors} name="startedAt" />
            </View>
          )}
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
      <Portal>
        {datePicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={startedAt}
            mode="date"
            is24Hour
            display="default"
            onChange={(event, selectedDate) => {
              setDatePicker(false)

              if (selectedDate) {
                setStartedAt(selectedDate)
                setValue(
                  'startedAt',
                  moment(selectedDate).startOf('day').format()
                )
                setValue(
                  'dayOfWeek',
                  moment(selectedDate).startOf('day').isoWeekday()
                )
                setStartedAtDefined(true)
              }
            }}
          />
        )}
      </Portal>
    </ASafeAreaView>
  )
}

export default ClientGroupEditScreen
