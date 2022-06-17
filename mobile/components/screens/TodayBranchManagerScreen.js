import { Dialog, List, Paragraph, Portal, Text, Menu } from 'react-native-paper'
import { Colors } from '@constants'
import { ScrollView, View, useWindowDimensions } from 'react-native'
import {
  useAuth,
  useClientsInspections,
  useLoanDisbursementsByBranchId,
  useUserProfile,
} from 'shared'
import { useFocusEffect } from '@react-navigation/core'
import { useQueryClient } from 'react-query'
import AAction from '@atoms/AAction'
import AActivityIndicator from '@atoms/AActivityIndicator'
import AAppbar from '@atoms/AAppbar'
import AButton from '@atoms/AButton'
import ASafeAreaView from '@atoms/ASafeAreaView'
import ASnackbar from '@atoms/ASnackbar'
import ATitle from '@atoms/ATitle'
import MAppVersion from '@molecules/MAppVersion'
import MUpdateBanner from '@molecules/MUpdateBanner'
import numeral from 'numeral'
import pluralize from 'pluralize'
import React, { useCallback, useEffect, useState } from 'react'

export function TodayBranchManagerScreen({ navigation, route }) {
  const [visible, setVisible] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [forceCheckForUpdate, setForceCheckForUpdate] = useState(false)

  const showDialog = () => setVisible(true)
  const hideDialog = () => setVisible(false)

  const [snackbar, setSnackbar] = useState(false)
  const [snackbarText, setSnackbarText] = useState()

  const queryClient = useQueryClient()

  const { _id, branchId, logOut } = useAuth()
  const { firstName } = useUserProfile()

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries('clientsInspections')
      queryClient.invalidateQueries('loanDisbursementsByBranchId')
    }, [branchId, queryClient])
  )

  useEffect(() => {
    if (route.params) {
      const { snackbar } = route.params

      if (snackbar) {
        setSnackbar(true)
        setSnackbarText(snackbar)
      }
    }
  }, [route.params])

  const {
    isLoading: isLoadingInspections,
    isFetching: isFetchingInspections,
    data: inspections,
  } = useClientsInspections({ enabled: !!_id })

  const {
    isLoading: isLoadingDisbursements,
    isFetching: isFetchingDisbursements,
    data: disbursements,
  } = useLoanDisbursementsByBranchId(branchId)

  const width = useWindowDimensions().width

  return (
    <ASafeAreaView>
      <AAppbar
        title={`Hello${firstName ? `, ${firstName}` : ''}`}
        back={false}
        navigation={navigation}
      >
        <Menu
          visible={showMenu}
          onDismiss={() => setShowMenu(false)}
          anchor={
            <AAction icon="more-vert" onPress={() => setShowMenu(true)} />
          }
        >
          <Menu.Item
            onPress={() => {
              setShowMenu(false)
              navigation.navigate('Change password')
            }}
            title="Change password"
            titleStyle={{ fontSize: 14 }}
          />
          <Menu.Item
            onPress={() => {
              setShowMenu(false)
              showDialog()
            }}
            title="Sign out"
            titleStyle={{ fontSize: 14 }}
          />
        </Menu>
      </AAppbar>
      <MUpdateBanner
        onForceCheckForUpdate={() => setForceCheckForUpdate(false)}
        forceCheckForUpdate={forceCheckForUpdate}
      />
      <ScrollView style={{ backgroundColor: Colors.white, flex: 1 }}>
        <View>
          <MAppVersion
            onForceCheckForUpdate={() => setForceCheckForUpdate(true)}
            forceCheckForUpdateInProgress={forceCheckForUpdate}
          />
          <View style={{ padding: 16, paddingBottom: 0 }}>
            <ATitle>Inspections</ATitle>
          </View>
          {(isLoadingInspections || isFetchingInspections || !inspections) && (
            <View style={{ padding: 16 }}>
              <AActivityIndicator />
            </View>
          )}
          {!isLoadingInspections && !isFetchingInspections && inspections && (
            <List.Section>
              {inspections
                .sort((a, b) => {
                  if (b.forms.length === a.forms.length) {
                    if (a.name < b.name) {
                      return -1
                    }

                    if (a.name > b.name) {
                      return 1
                    }

                    return 0
                  }

                  return b.forms.length - a.forms.length
                })
                .map(group => (
                  <List.Item
                    key={group._id}
                    title={group.name}
                    description={
                      <View>
                        <Text
                          style={{
                            color: Colors.placeholder,
                            width: width - 32,
                          }}
                        >
                          {group.address}
                        </Text>
                        <Text style={{ color: Colors.placeholder }}>
                          {group.forms.length}{' '}
                          {pluralize('loan application', group.forms.length)}
                        </Text>
                      </View>
                    }
                    onPress={() =>
                      navigation.navigate('Inspections', {
                        group,
                      })
                    }
                  />
                ))}
            </List.Section>
          )}
          {!isLoadingInspections &&
            !isFetchingInspections &&
            inspections &&
            inspections.length === 0 && (
              <Text style={{ padding: 16, fontSize: 16 }}>No inspections</Text>
            )}
          <View style={{ padding: 16, paddingBottom: 0 }}>
            <ATitle>Disbursements</ATitle>
          </View>
          {(isLoadingDisbursements ||
            isFetchingDisbursements ||
            !disbursements) && (
            <View style={{ padding: 16 }}>
              <AActivityIndicator />
            </View>
          )}
          {!isLoadingDisbursements &&
            !isFetchingDisbursements &&
            disbursements && (
              <List.Section>
                {disbursements.map(loan => (
                  <List.Item
                    key={loan._id}
                    title={`${loan?.forms.inspection.client.lastName}, ${loan?.forms.inspection.client.firstName}`}
                    description={
                      <View>
                        <Text style={{ color: Colors.placeholder }}>
                          USh{' '}
                          {numeral(
                            loan?.forms.inspection.content.loan.amount
                          ).format('0,0')}
                        </Text>
                      </View>
                    }
                    onPress={() =>
                      navigation.navigate('Client: Loan: Disbursement', {
                        loanId: loan._id,
                      })
                    }
                  />
                ))}
              </List.Section>
            )}
          {!isLoadingDisbursements &&
            !isFetchingDisbursements &&
            disbursements &&
            disbursements.length === 0 && (
              <Text style={{ padding: 16, fontSize: 16 }}>
                No disbursements
              </Text>
            )}
        </View>
      </ScrollView>
      <Portal>
        <Dialog visible={visible} onDismiss={hideDialog}>
          <Dialog.Content>
            <Paragraph>Are you sure you want to sign out?</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <AButton onPress={hideDialog}>No</AButton>
            <AButton onPress={() => logOut()}>Yes, I’m sure</AButton>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <Portal>
        <ASnackbar
          visible={snackbar}
          duration={1000}
          onDismiss={() => {
            setSnackbar(false)
            setSnackbarText(null)
          }}
          style={{ marginBottom: 64 }}
        >
          {snackbarText}
        </ASnackbar>
      </Portal>
    </ASafeAreaView>
  )
}

export default TodayBranchManagerScreen
