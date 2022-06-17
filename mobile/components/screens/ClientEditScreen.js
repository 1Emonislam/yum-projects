import AButton from '@atoms/AButton'
import AButtonWithLoader from '@atoms/AButtonWithLoader'
import ASafeAreaView from '@atoms/ASafeAreaView'
import ATitle from '@atoms/ATitle'
import MFormText from '@molecules/MFormText'
import MFormRadioGroup from '@molecules/MFormRadioGroup'
import { Colors } from '@constants'
import React, { useCallback, useState } from 'react'
import { ScrollView, View } from 'react-native'
import { Dialog, Paragraph, Portal, Text } from 'react-native-paper'
import { useHeader, useScrollToTopOnError } from '@hooks'
import {
  useAuth,
  useClientGroupsByLoanOfficerIdOrBranchId,
  useUserProfile,
  useClientEditForm,
} from 'shared'

export function ClientEditScreen({ navigation, route }) {
  const clientId = route?.params?.clientId

  const {
    scrollViewRef,
    scrollToTopErrorHandler: onError,
    renderErrorMessage,
  } = useScrollToTopOnError()

  const {
    control,
    errors,
    submit,
    isFetching,
    isSubmitting,
  } = useClientEditForm(clientId, {
    onSuccess: () => navigation.goBack(),
    onError,
  })

  const { isBranchManager } = useAuth()

  const { _id: loanOfficerId, branchId } = useUserProfile()

  const {
    isLoading: isLoadingGroups,
    data: clientGroups,
  } = useClientGroupsByLoanOfficerIdOrBranchId({
    id: isBranchManager ? branchId : loanOfficerId,
    by: isBranchManager ? 'branch' : 'loanOfficer',
  })

  const [dialog, setDialog] = useState(false)
  const showDialog = () => setDialog(true)
  const hideDialog = () => setDialog(false)

  const renderClientGroups = useCallback(() => {
    if (!isLoadingGroups && clientGroups.length !== 0) {
      return (
        <MFormRadioGroup
          label="Group"
          name="clientGroupId"
          items={clientGroups.map(group => {
            return {
              value: group._id,
              label: group.name,
            }
          })}
          control={control}
          errors={errors}
        />
      )
    } else {
      return (
        <View style={{ paddingTop: 16 }}>
          <Paragraph style={{ color: Colors.placeholder }}>
            You have no groups.{' '}
            {isBranchManager
              ? 'Ask a loan officer to add a group in the mobile app and submit it for approval. Once you approve it, it will show up here.'
              : 'Go back to the “Client groups” screen and add a group there.'}
          </Paragraph>
        </View>
      )
    }
  }, [clientGroups, control, errors, isLoadingGroups, navigation])

  useHeader({
    title: isFetching ? 'Loading…' : 'Edit client',
    // actions: (
    //   <Appbar.Action color={Colors.black} icon="delete" onPress={showDialog} />
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
              label="First name"
              name="firstName"
              control={control}
              errors={errors}
            />
            <MFormText
              label="Last name"
              name="lastName"
              control={control}
              errors={errors}
            />
            {/* {renderClientGroups()} */}
            <View style={{ paddingTop: 16 }}>
              <ATitle>For admission</ATitle>
            </View>
            <MFormText
              label="Address"
              name="admission.address"
              control={control}
              errors={errors}
              multiline
              numberOfLines={1}
            />
            <MFormText
              label="Notes"
              name="admission.notes"
              control={control}
              errors={errors}
              multiline
              numberOfLines={1}
              rules={{ required: false }}
            />
            <View style={{ marginTop: 16 }}>
              <AButtonWithLoader
                mode="contained"
                onPress={submit}
                loading={isSubmitting}
                disabled={!isLoadingGroups && clientGroups.length === 0}
              >
                Save
              </AButtonWithLoader>
            </View>
          </View>
        </ScrollView>
      )}
      {/* <Portal>
        <Dialog visible={dialog} onDismiss={hideDialog}>
          <Dialog.Content>
            <Paragraph>
              You can’t delete a client with an active loan.
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <AButton onPress={hideDialog}>OK</AButton>
          </Dialog.Actions>
        </Dialog>
      </Portal> */}
    </ASafeAreaView>
  )
}

export default ClientEditScreen
