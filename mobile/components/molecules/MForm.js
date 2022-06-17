import { Colors } from '@constants'
import { getColorByStatus } from '@utils'
import { List, Text } from 'react-native-paper'
import { timezone } from 'shared'
import { View } from 'react-native'
import capitalize from 'lodash/capitalize'
import moment from 'moment-timezone'
import React from 'react'

const MForm = ({ client, id, navigation, status, type, updatedAt }) => (
  <List.Item
    title={type === 'application' ? 'Loan application' : 'Client inspection'}
    description={
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: -4,
        }}
      >
        <View
          style={{
            width: 12,
            height: 12,
            backgroundColor: getColorByStatus(status),
            marginRight: 4,
            marginTop: 1,
          }}
        />
        <Text style={{ color: getColorByStatus(status, true) }}>
          {capitalize(status)}
        </Text>
        <Text style={{ color: Colors.placeholder }}>
          {' '}
          · {moment(updatedAt).tz(timezone).format('dddd, D MMMM YYYY, H:mm')}
        </Text>
      </View>
    }
    onPress={() => {
      navigation.navigate(
        type === 'application'
          ? 'Form: Loan Application'
          : 'Form: Client Inspection',
        {
          formId: id,
          client: client,
        }
      )
    }}
  />
)

export default MForm
