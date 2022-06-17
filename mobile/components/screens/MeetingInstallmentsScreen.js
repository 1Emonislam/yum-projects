import { Checkbox, List } from 'react-native-paper'
import { Colors } from '@constants'
import { ScrollView } from 'react-native'
import { useMeetingLogic } from 'shared'
import AList from '@atoms/AList'
import ASafeAreaView from '@atoms/ASafeAreaView'
import numeral from 'numeral'
import React, { useCallback } from 'react'

export function MeetingInstallmentsScreen({ navigation, route }) {
  const clientGroupId = route?.params?.clientGroupId
  const [todayMeeting, isLoading] = useMeetingLogic(clientGroupId)

  const renderItem = useCallback(
    ({ item }) => {
      const client = todayMeeting.attendance.find(
        a => a.clientId === item.clientId
      )

      const status =
        item.todaysRealization === null || item.todaysRealization === 'null'
          ? 'unchecked'
          : 'checked'

      const amountRaw = item.installment === 0 ? item.overdue : item.installment

      const amount = `USh ${numeral(amountRaw).format('0,0')}`

      const durationValue = item.durationValue

      const durationUnit = item.durationUnit === 'month' ? 'months' : 'weeks'

      const durationBiweeklySuffix =
        item.durationUnit === 'twoWeeks' ? ', biweekly' : ''

      const duration = item.durationValue
        ? [
            ' · ',
            durationValue,
            ' ',
            durationUnit,
            durationBiweeklySuffix,
          ].join('')
        : ''

      const overdue = item.installment === 0 ? ' (overdue only)' : ''

      const description = [amount, duration, overdue].join('')

      return (
        <List.Item
          key={item.loanId}
          title={`${client.lastName} ${client.firstName}`}
          description={description}
          left={() => <Checkbox status={status} color={Colors.green} />}
          onPress={() =>
            navigation.navigate('Meeting: Collect installments: Installment', {
              clientGroupId,
              clientId: item.clientId,
              loanId: item.loanId,
            })
          }
        />
      )
    },
    [clientGroupId, navigation, todayMeeting.attendance]
  )

  if (todayMeeting === null && isLoading) {
    return null
  }

  return (
    <ASafeAreaView>
      <ScrollView style={{ backgroundColor: Colors.white, flex: 1 }}>
        <List.Section>
          <AList
            data={todayMeeting.installments}
            renderItem={renderItem}
            noFlatList
          />
        </List.Section>
      </ScrollView>
    </ASafeAreaView>
  )
}

export default MeetingInstallmentsScreen
