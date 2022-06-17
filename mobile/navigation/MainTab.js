import React from 'react'
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs'
import { Colors } from '@constants'
import TodayLoanOfficerScreen from '@screens/TodayLoanOfficerScreen'
import TodayBranchManagerScreen from '@screens/TodayBranchManagerScreen'
import ClientsScreen from '@screens/ClientsScreen'
import YamIcon from '@icons/YamIcon'
import ClientsIcon from '@icons/ClientsIcon'
import { useAuth } from 'shared'

const Tab = createMaterialBottomTabNavigator()

function MainTab() {
  const { isLoanOfficer } = useAuth()

  return (
    <Tab.Navigator
      initialRouteName="Today"
      backBehavior="initialRoute"
      shifting
      activeColor={Colors.white}
      inactiveColor={Colors.greenAlt}
      barStyle={{ backgroundColor: Colors.green }}
      keyboardHidesNavigationBar
      sceneAnimationEnabled
    >
      <Tab.Screen
        name="Today"
        component={
          isLoanOfficer ? TodayLoanOfficerScreen : TodayBranchManagerScreen
        }
        options={{
          tabBarIcon: ({ color }) => {
            return <YamIcon size={24} color={color} />
          },
        }}
      />
      <Tab.Screen
        name="Clients"
        component={ClientsScreen}
        options={{
          tabBarIcon: ({ color }) => {
            return <ClientsIcon size={24} color={color} />
          },
        }}
      />
    </Tab.Navigator>
  )
}

export default MainTab
