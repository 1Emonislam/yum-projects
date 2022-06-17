import ASafeAreaView from '@atoms/ASafeAreaView'
import { Colors } from '@constants'
import React from 'react'
import { List } from 'react-native-paper'
import { ScrollView } from 'react-native'

export function ClientSaleScreen({ navigation }) {
  // FIXME: get data for the whole screen (NOT IN V1)

  return (
    <ASafeAreaView>
      <ScrollView style={{ backgroundColor: Colors.white, flex: 1 }}>
        <List.Section>
          <List.Subheader>Select the product</List.Subheader>
          <List.Item
            title="Passbook"
            description="USh 2,000"
            onPress={() => navigation.navigate('Client: Sale: Details')}
          />
          <List.Item
            title="Some other product"
            description="USh 2,000"
            onPress={() => navigation.navigate('Client: Sale: Details')}
          />
        </List.Section>
      </ScrollView>
    </ASafeAreaView>
  )
}

export default ClientSaleScreen
