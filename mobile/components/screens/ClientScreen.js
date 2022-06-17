import {
  Avatar,
  Checkbox,
  Dialog,
  Divider,
  List,
  Paragraph,
  Portal,
  Subheading,
  Text,
  TouchableRipple,
} from 'react-native-paper'
import { Colors } from '@constants'
import { Controller, useForm } from 'react-hook-form'
import { getColorByStatus } from '@utils'
import {
  getClientRole,
  useClientById,
  useFormsByClientId,
  useInsertEvent,
  useLoansByClientId,
} from 'shared'
import { ScrollView, View } from 'react-native'
import { useHeader } from '@hooks'
import AButton from '@atoms/AButton'
import AHelperText from '@atoms/AHelperText'
import AList from '../atoms/AList'
import ASafeAreaView from '@atoms/ASafeAreaView'
import ATitle from '@atoms/ATitle'
import capitalize from 'lodash/capitalize'
import MField from '@molecules/MField'
import MForm from '@molecules/MForm'
import moment from 'moment-timezone'
import numeral from 'numeral'
import React, { useEffect, useState, useCallback, useMemo } from 'react'

export function ClientScreen({ navigation, route }) {
  const clientId = route?.params?.clientId

  const { control, errors, handleSubmit, watch } = useForm()

  const admissionSmallLoanValue = watch('admissionSmallLoan', false)
  const admissionSmallBusinessLoanValue = watch(
    'admissionSmallBusinessLoan',
    false
  )

  const {
    data: client,
    isLoading,
    isFetching,
    refetch,
  } = useClientById(clientId)
  const { data: loans, isFetching: isFetchingLoans } =
    useLoansByClientId(clientId)
  const { data: forms, isLoading: isFetchingForms } =
    useFormsByClientId(clientId)

  const { mutate: mutateStatus, isLoading: isMutatingStatus } = useInsertEvent()

  const { mutate: mutateToSurveyStatus, isLoading: isMutatingToSurveyStatus } =
    useInsertEvent()

  const { mutate: mutatePassbook, isLoading: isMutatingPassbook } =
    useInsertEvent()

  const [status, setStatus] = useState()
  const [passbook, setPassbook] = useState()
  const [activationDialog, setActivationDialog] = useState(false)
  const [deactivationDialog, setDeactivationDialog] = useState(false)
  const [allowDeactivation, setAllowDeactivation] = useState(false)

  const showActivationDialog = () => {
    setActivationDialog(true)
  }

  const hideActivationDialog = () => {
    setActivationDialog(false)
  }

  const showDeactivationDialog = () => {
    setDeactivationDialog(true)
  }

  const hideDeactivationDialog = () => {
    setDeactivationDialog(false)
  }

  const activateClient = () => {
    hideActivationDialog()

    setStatus('toSurvey')

    mutateStatus(
      {
        type: 'update',
        obj: 'client',
        status: 'toSurvey',
        lastRenewalAt: new Date(),
        admission: {
          ...client.admission,
          smallBusinessLoan: admissionSmallBusinessLoanValue,
        },
        _id: clientId,
      },
      {
        onSuccess: () => {
          refetch()
        },
      }
    )
  }

  const deactivateClient = () => {
    hideDeactivationDialog()

    setStatus('inactive')
    setPassbook(false)

    mutateStatus(
      {
        type: 'update',
        obj: 'client',
        status: 'inactive',
        passbook: false,
        _id: clientId,
      },
      {
        onSuccess: () => {
          refetch()
        },
      }
    )
  }

  const toggleToSurvey = () => {
    if (!isMutatingToSurveyStatus && !isFetching) {
      setStatus('toSurvey')

      mutateToSurveyStatus(
        {
          type: 'update',
          obj: 'client',
          status: 'toSurvey',
          _id: clientId,
        },
        {
          onSuccess: () => {
            refetch()
          },
        }
      )
    }
  }

  const togglePassbook = () => {
    if (!isMutatingPassbook && !isFetching) {
      setPassbook(!passbook)

      mutatePassbook(
        {
          type: 'update',
          obj: 'client',
          passbook: !client.passbook,
          _id: clientId,
        },
        {
          onSuccess: () => {
            refetch()
          },
        }
      )
    }
  }

  useMemo(() => {
    if (client) {
      setStatus(client.status)
      setPassbook(client.passbook)
    }
  }, [client])

  const renderLoan = useCallback(
    ({ item }) => {
      return (
        <List.Item
          title={`USh ${numeral(
            item.approvedAmount || item.requestedAmount
          ).format('0,0')}`}
          key={item._id}
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
                  backgroundColor: getColorByStatus(item?.status),
                  marginRight: 4,
                  marginTop: 1,
                }}
              />
              <Text style={{ color: getColorByStatus(item?.status, true) }}>
                {capitalize(item?.status)
                  .replace('Awaitingmanagerreview', 'Awaiting manager review')
                  .replace('Approvedbymanager', 'Approved')
                  .replace('Rejectedbymanager', 'Rejected')
                  .replace('Notpaid', 'Not paid')}
              </Text>
            </View>
          }
          onPress={() =>
            navigation.navigate('Client: Loan', {
              loanId: item._id,
              client,
            })
          }
        />
      )
    },
    [client, navigation]
  )

  const renderForm = useCallback(
    ({ item }) => {
      return (
        <MForm
          client={client}
          id={item._id}
          key={item._id}
          navigation={navigation}
          status={item.status}
          type={item.type}
          updatedAt={item.updatedAt}
        />
      )
    },
    [client, navigation]
  )

  useHeader({
    title:
      client?.lastName && client?.firstName
        ? `${client?.lastName}, ${client?.firstName}`
        : 'Loading…',
    actions:
      client?.photo && client?.photo !== '' ? (
        <View style={{ paddingRight: 12 }}>
          <TouchableRipple
            borderless
            centered
            onPress={() =>
              navigation.navigate('Client: Photo', {
                clientId: client?._id,
              })
            }
            style={{ borderRadius: 32, overflow: 'hidden' }}
          >
            <Avatar.Image
              size={32}
              source={{
                uri: client.photo,
              }}
            />
          </TouchableRipple>
        </View>
      ) : (
        <View />
      ),
  })

  useEffect(() => {
    if (loans) {
      let hasActiveLoans = loans.some(loan => loan.status === 'active')

      setAllowDeactivation(!hasActiveLoans)
    }
  }, [loans])

  return (
    <ASafeAreaView>
      {!isLoading && client && (
        <ScrollView style={{ backgroundColor: Colors.white, flex: 1 }}>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              padding: 16,
              paddingBottom: 0,
            }}
          >
            <MField label="Status">
              {capitalize(String(status).replace('toSurvey', 'To survey'))}
            </MField>
            <MField label="Code">{client?.code ?? 'C001'}</MField>
            <MField label="Passbook">
              {passbook ? 'Provided' : 'Missing'}
            </MField>
            <MField label="Group">{client?.clientGroup?.name ?? ''}</MField>
            <MField label="Joined">
              {moment(client?.admissionAt || client?.addedAt).format(
                'D MMMM YYYY'
              )}
            </MField>
            <MField label="Role">
              {getClientRole(client?._id, client?.clientGroup)}
            </MField>
            <MField label="Security balance">
              USh {numeral(client?.securityBalance || 0).format('0,0')}
            </MField>
          </View>
          <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
            <Text
              style={{
                fontSize: 14,
                color: Colors.placeholder,
                fontFamily: 'sans-serif-medium',
              }}
            >
              Address
            </Text>
            <Text style={{ fontSize: 16 }}>{client?.admission?.address}</Text>
          </View>
          {client?.admission?.notes !== null &&
            client?.admission?.notes !== '' && (
              <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 16,
                    color: Colors.placeholder,
                    fontFamily: 'sans-serif-medium',
                  }}
                >
                  Notes:
                </Text>
                <Text style={{ fontSize: 16 }}>{client?.admission?.notes}</Text>
              </View>
            )}
          <Divider />
          <View style={{ paddingLeft: 16, paddingTop: 16, paddingBottom: 0 }}>
            <ATitle>Loans</ATitle>
          </View>
          <List.Section>
            <AList
              noFlatList
              isFetching={isFetchingLoans}
              data={loans}
              renderItem={renderLoan}
              emptyStateText="No loans"
            />
          </List.Section>
          <Divider />
          <View style={{ paddingLeft: 16, paddingTop: 16, paddingBottom: 0 }}>
            <ATitle>Forms</ATitle>
          </View>
          <List.Section>
            <AList
              noFlatList
              data={forms}
              renderItem={renderForm}
              isFetching={isFetchingForms}
              emptyStateText={'No forms'}
            />
          </List.Section>
          <Divider />
          {/* FIXME: needs to be implemented in the future (not in V1)
          <View style={{ paddingLeft: 16, paddingTop: 16, paddingBottom: 0 }}>
            <ATitle>Purchases</ATitle>
          </View>
          <List.Section>
            <List.Item
              title="Passbook"
              description="USh 2,000 · 10 December 2020, 11:59"
              // right={() => <IconButton icon="undo" size={24} />}
              right={() => (
                <IconButton
                  // icon="delete"
                  icon="settings-backup-restore"
                  size={24}
                  onPress={() => showDialog()}
                />
              )}
            />
          </List.Section>
          <Divider /> */}
          <View style={{ paddingLeft: 16, paddingTop: 16 }}>
            <ATitle>Actions</ATitle>
          </View>
          <List.Section>
            {/* {status === 'active' && (
              <List.Item
                title={isMutatingStatus ? 'Updating…' : 'Mark as inactive'}
                onPress={showDeactivationDialog}
                disabled={!allowDeactivation}
                style={allowDeactivation ? {} : { opacity: 0.4 }}
              />
            )} */}
            {status === 'inactive' && (
              <List.Item
                title={
                  isMutatingStatus ? 'Updating…' : 'Mark as a client to survey'
                }
                onPress={showActivationDialog}
              />
            )}
            {status === 'active' && (
              <List.Item
                title={
                  isMutatingToSurveyStatus
                    ? 'Updating…'
                    : 'Mark as a client to survey'
                }
                onPress={toggleToSurvey}
                // disabled={!allowDeactivation}
                // style={allowDeactivation ? {} : { opacity: 0.4 }}
              />
            )}
            {status !== 'inactive' && (
              <List.Item
                title={
                  isMutatingPassbook
                    ? 'Updating…'
                    : `Mark passbook as ${passbook ? 'missing' : 'provided'}`
                }
                onPress={togglePassbook}
              />
            )}
            {status === 'active' && (
              <List.Item
                title="Renew membership"
                onPress={() =>
                  navigation.navigate('Client: Membership', { clientId })
                }
              />
            )}
            <List.Item
              title="Edit client"
              onPress={() => navigation.navigate('Client: Edit', { clientId })}
            />
          </List.Section>
        </ScrollView>
      )}
      <Portal>
        <Dialog visible={deactivationDialog} onDismiss={hideDeactivationDialog}>
          <Dialog.Title style={{ color: Colors.red }}>
            Client deactivation
          </Dialog.Title>
          <Dialog.Content>
            <Paragraph
              style={{ fontFamily: 'sans-serif-medium', marginBottom: 16 }}
            >
              If you deactivate the client, they will have to pay the admission
              and passbook fees again before submitting another loan
              application.
            </Paragraph>
            <Paragraph>
              Did you return the savings to {client?.firstName}{' '}
              {client?.lastName}?
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <AButton onPress={hideDeactivationDialog}>No</AButton>
            <AButton onPress={deactivateClient}>Yes, I did</AButton>
          </Dialog.Actions>
        </Dialog>
        <Dialog visible={activationDialog} onDismiss={hideActivationDialog}>
          <Dialog.Title>Client activation</Dialog.Title>
          <View style={{ paddingHorizontal: 24 }}>
            <Subheading style={{ paddingBottom: 12 }}>
              Mark the fees paid by the client:
            </Subheading>
            {(errors.admissionSmallLoan ||
              errors.admissionSmallBusinessLoan ||
              errors.passbook) && (
              <View style={{ paddingBottom: 8 }}>
                <AHelperText error>
                  The client has to pay passbook and one admission fee
                </AHelperText>
              </View>
            )}
          </View>
          <Controller
            control={control}
            render={({ onChange, onBlur, value }) => (
              <List.Item
                title="Admission (Small Business Loan)"
                description="USh 4,000"
                left={() => (
                  <Checkbox
                    status={value ? 'checked' : 'unchecked'}
                    color={Colors.green}
                    onBlur={onBlur}
                  />
                )}
                style={{ paddingLeft: 16 }}
                onPress={() => onChange(!value)}
              />
            )}
            name="admissionSmallBusinessLoan"
            rules={{
              validate: value =>
                admissionSmallLoanValue === true
                  ? true
                  : value === true
                  ? true
                  : false,
            }}
            defaultValue={false}
          />
          <Controller
            control={control}
            render={({ onChange, onBlur, value }) => (
              <List.Item
                title="Admission (Small Loan, Monthly Loan)"
                description="USh 2,000"
                left={() => (
                  <Checkbox
                    status={value ? 'checked' : 'unchecked'}
                    color={Colors.green}
                    onBlur={onBlur}
                  />
                )}
                style={{ paddingLeft: 16 }}
                onPress={() => onChange(!value)}
              />
            )}
            name="admissionSmallLoan"
            rules={{
              validate: value =>
                admissionSmallBusinessLoanValue === true
                  ? true
                  : value === true
                  ? true
                  : false,
            }}
            defaultValue={false}
          />
          <Controller
            control={control}
            render={({ onChange, onBlur, value }) => (
              <List.Item
                title="Passbook"
                description="USh 2,000"
                left={() => (
                  <Checkbox
                    status={value ? 'checked' : 'unchecked'}
                    color={Colors.green}
                    onBlur={onBlur}
                  />
                )}
                style={{ paddingLeft: 16 }}
                onPress={() => onChange(!value)}
              />
            )}
            name="passbook"
            rules={{ required: true }}
            defaultValue={false}
          />
          <Dialog.Actions>
            <AButton onPress={hideActivationDialog}>Cancel</AButton>
            <AButton onPress={handleSubmit(activateClient)}>Activate</AButton>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ASafeAreaView>
  )
}

export default ClientScreen
