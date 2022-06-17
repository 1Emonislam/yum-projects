import React, { useCallback, useEffect } from 'react'
import { ScrollView, View } from 'react-native'
import { useQueryClient } from 'react-query'
import { Appbar, Divider, List, Text } from 'react-native-paper'
import { Controller, useForm } from 'react-hook-form'
import numeral from 'numeral'
import ASafeAreaView from '@atoms/ASafeAreaView'
import AButtonWithLoader from '@atoms/AButtonWithLoader'
import MListItemCurrency from '@molecules/MListItemCurrency'
import { Colors } from '@constants'
import {
  required,
  useClientById,
  useCollectInstallment,
  useMeetingLogic,
} from 'shared'
import { useHeader } from '@hooks'
import MError from '../molecules/MError'

const descriptionStyle = {
  width: '75%',
}

export function MeetingInstallmentScreen({ navigation, route }) {
  const clientId = route?.params?.clientId

  const clientGroupId = route?.params?.clientGroupId

  const loanId = route?.params?.loanId

  const { data: client } = useClientById(clientId)

  const queryClient = useQueryClient()

  const [todayMeeting, isLoading] = useMeetingLogic(clientGroupId)

  const { mutate: collectInstallment, isLoading: isMutating } =
    useCollectInstallment()

  const { control, errors, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      todaysRealization: '',
    },
  })

  const todaysRealization = watch('todaysRealization')

  useEffect(() => {
    if (todayMeeting && clientId) {
      const installment = todayMeeting?.installments?.find(
        i => i.clientId === clientId
      )
      const { todaysRealization } = installment
      if (todaysRealization !== null) {
        setValue('todaysRealization', todaysRealization)
      }
    }
  }, [todayMeeting, clientId, setValue])

  const onValid = useCallback(
    async values => {
      const installment = todayMeeting?.installments?.find?.(
        i => i.loanId === loanId
      )
      const modifiedInstallment = {
        ...installment,
        ...values,
      }

      const input = {
        _id: modifiedInstallment._id,
        loanId: modifiedInstallment.loanId,
        todaysRealization: Number(modifiedInstallment.todaysRealization),
        clientGroupMeetingId: todayMeeting._id,
      }
      collectInstallment(input, {
        onSuccess: () => {
          queryClient.invalidateQueries([
            'todayMeetingByClientGroupId',
            clientGroupId,
          ])
          queryClient.invalidateQueries([
            'loanById',
            modifiedInstallment.loanId,
          ])
          navigation.goBack()
        },
      })
    },
    [
      todayMeeting?.installments,
      todayMeeting._id,
      collectInstallment,
      loanId,
      queryClient,
      clientGroupId,
      navigation,
    ]
  )

  const save = handleSubmit(onValid)

  useHeader({
    title: client?.firstName
      ? `${client?.lastName} ${client?.firstName}`
      : 'Loading…',
    actions: (
      <Appbar.Action
        color={Colors.black}
        icon="clients"
        onPress={() => navigation.navigate('Client', { clientId })}
      />
    ),
  })

  if (todayMeeting === null && isLoading) {
    return null
  }

  const installment = todayMeeting?.installments?.find(i => i.loanId === loanId)

  return (
    <ASafeAreaView>
      <ScrollView style={{ backgroundColor: Colors.white, flex: 1 }}>
        <List.Section>
          <List.Item
            title="Installment:"
            description="Today’s basic installment"
            descriptionStyle={descriptionStyle}
            right={() => (
              <Text style={{ fontSize: 16, paddingTop: 6, paddingRight: 6 }}>
                USh {numeral(installment.installment).format('0,0')}
              </Text>
            )}
          />
          <List.Item
            title="Overdue:"
            description="Amount that was late to pay"
            descriptionStyle={descriptionStyle}
            right={() => (
              <Text style={{ fontSize: 16, paddingTop: 6, paddingRight: 6 }}>
                USh {numeral(installment.overdue).format('0,0')}
              </Text>
            )}
          />
          <List.Item
            title="Missed installments:"
            description="Number of installments that were not fully paid"
            descriptionStyle={descriptionStyle}
            right={() => (
              <Text style={{ fontSize: 16, paddingTop: 6, paddingRight: 6 }}>
                {installment.overdueInstallments}
              </Text>
            )}
          />
          <List.Item
            title="Today’s target:"
            description={
              installment.installment === 0
                ? 'Overdue amount'
                : 'Installment amount'
            }
            descriptionStyle={descriptionStyle}
            right={() => (
              <Text style={{ fontSize: 16, paddingTop: 6, paddingRight: 6 }}>
                USh{' '}
                {numeral(
                  installment.installment === 0
                    ? installment.overdue
                    : installment.installment
                ).format('0,0')}
              </Text>
            )}
          />
          <List.Item
            title="Opening balance:"
            description="Amount still owed, before paying the current installment"
            descriptionStyle={descriptionStyle}
            right={() => (
              <Text style={{ fontSize: 16, paddingTop: 6, paddingRight: 6 }}>
                {installment?.openingBalance
                  ? `USh ${numeral(
                      parseInt(installment?.openingBalance)
                    ).format('0,0')}`
                  : '—'}
              </Text>
            )}
          />
          <Controller
            control={control}
            render={({ onChange, onBlur, value }) => (
              <MListItemCurrency
                title="Today’s realization"
                value={String(value)}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
            rules={{ required: { value: true, message: required } }}
            name="todaysRealization"
          />
          <View style={{ flexDirection: 'row-reverse', paddingHorizontal: 16 }}>
            <MError errors={errors} name={'todaysRealization'} />
          </View>
          <List.Item
            title="Cumulative realization:"
            description="Sum of all payments (including the current one)"
            descriptionStyle={descriptionStyle}
            right={() => (
              <Text style={{ fontSize: 16, paddingTop: 6, paddingRight: 6 }}>
                {`USh ${numeral(
                  parseInt(installment.cumulativeRealization) +
                    parseInt(todaysRealization || 0)
                ).format('0,0')}`}
              </Text>
            )}
          />
          <List.Item
            title="Outstanding balance:"
            description="Amount still owed, after paying the current installment"
            descriptionStyle={descriptionStyle}
            right={() => (
              <Text style={{ fontSize: 16, paddingTop: 6, paddingRight: 6 }}>
                {todaysRealization === ''
                  ? '—'
                  : `USh ${numeral(
                      parseInt(installment?.openingBalance) -
                        parseInt(todaysRealization)
                    ).format('0,0')}`}
              </Text>
            )}
          />
        </List.Section>
        <Divider />
        <View style={{ padding: 16 }}>
          <AButtonWithLoader
            loading={isMutating}
            mode="contained"
            onPress={save}
          >
            Save
          </AButtonWithLoader>
        </View>
      </ScrollView>
    </ASafeAreaView>
  )
}

export default MeetingInstallmentScreen
