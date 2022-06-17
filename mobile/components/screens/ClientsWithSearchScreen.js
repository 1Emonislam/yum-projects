import AFabGroup from '@atoms/AFabGroup'
import ASafeAreaView from '@atoms/ASafeAreaView'
import ATitle from '@atoms/ATitle'
import { Colors } from '@constants'
import data from '@data'
import { useIsFocused } from '@react-navigation/native'
import React, { useState } from 'react'
import { ScrollView, View } from 'react-native'
import { List, Searchbar } from 'react-native-paper'
import Constants from 'expo-constants'

export function ClientsWithSearchScreen({ navigation }) {
  const [value, setValue] = useState()

  const isFocused = useIsFocused()

  return (
    <ASafeAreaView>
      <View style={{ backgroundColor: Colors.white, flex: 1, flexGrow: 1 }}>
        <View
          style={{
            position: 'absolute',
            top: 0,
            height: Constants.statusBarHeight + 8,
            left: 16,
            right: 16,
            backgroundColor: Colors.white,
            zIndex: 10,
          }}
        ></View>
        <Searchbar
          placeholder="Search for clients and groups"
          style={{
            position: 'absolute',
            top: Constants.statusBarHeight + 8,
            left: 16,
            right: 16,
            zIndex: 20,
          }}
          value={value}
          onChangeText={value => setValue(value)}
          icon="search"
          iconColor={Colors.black}
          inputStyle={{ fontSize: 16 }}
        />
        <ScrollView
          style={{
            flex: 1,
            flexGrow: 1,
            marginTop: 56 + Constants.statusBarHeight,
          }}
        >
          <View>
            <View style={{ padding: 16, paddingBottom: 0 }}>
              <ATitle>Client Groups</ATitle>
            </View>
            <List.Section>
              {data.groups.map((group, index) => (
                <List.Item
                  key={index}
                  title={group.name}
                  description={`${group.time} · ${group.address}`}
                  rippleColor={Colors.orangeBackground}
                  onPress={() => {}}
                />
              ))}
            </List.Section>
          </View>
        </ScrollView>
      </View>
      <AFabGroup
        icon="add"
        isFocused={isFocused}
        actions={[
          {
            icon: 'group',
            label: 'New group',
            color: Colors.green,
            onPress: () => {},
          },
          {
            icon: 'clients',
            label: 'New client',
            color: Colors.green,
            onPress: () => {},
          },
        ]}
        onPress={() => {}}
        style={{ paddingBottom: 56 }}
      />
      {/* <Snackbar
        visible
        onDismiss={() => {}}
        action={{
          label: "Undo",
          onPress: () => {},
        }}
        style={{ backgroundColor: Colors.black }}
      >
        Someone made a typo
      </Snackbar> */}
    </ASafeAreaView>
  )
}

export default ClientsWithSearchScreen
