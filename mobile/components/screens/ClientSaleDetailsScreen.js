import AButton from '@atoms/AButton'
import ASafeAreaView from '@atoms/ASafeAreaView'
import ATextInput from '@atoms/ATextInput'
import { Colors } from '@constants'
import React, { useState } from 'react'
import { ScrollView, View } from 'react-native'
import { List, Text, Switch } from 'react-native-paper'

export function ClientSaleDetailsScreen({ navigation }) {
  const [isSwitchOn, setIsSwitchOn] = useState(false)

  // FIXME: get data for the whole screen (NOT IN V1)

  return (
    <ASafeAreaView>
      <ScrollView style={{ backgroundColor: Colors.white, flex: 1 }}>
        <List.Section>
          <List.Item
            title="Price:"
            right={() => (
              <Text style={{ fontSize: 16, paddingTop: 6, paddingRight: 6 }}>
                USh 2,000
              </Text>
            )}
          />
          <List.Item
            title="Passbook Identifier:"
            right={() => (
              <ATextInput autoFocus style={{ width: '50%', marginRight: 6 }} />
            )}
          />
          <List.Item
            title="Paid:"
            right={() => (
              <Switch
                value={isSwitchOn}
                onValueChange={() => setIsSwitchOn(!isSwitchOn)}
                color={Colors.green}
              />
            )}
          />
        </List.Section>
        <View style={{ paddingHorizontal: 16 }}>
          <AButton
            mode="contained"
            disabled={!isSwitchOn}
            onPress={() => {
              navigation.goBack()
              navigation.goBack()
            }}
          >
            Sell
          </AButton>
        </View>
      </ScrollView>
    </ASafeAreaView>
  )
}

export default ClientSaleDetailsScreen
