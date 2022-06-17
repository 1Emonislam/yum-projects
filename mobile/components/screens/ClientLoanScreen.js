import { Caption, DataTable, Divider, List, Text } from 'react-native-paper'
import { Colors } from '@constants'
import { timezone, useLoanById } from 'shared'
import { ScrollView, View } from 'react-native'
import { useHeader } from '@hooks'
import ASafeAreaView from '@atoms/ASafeAreaView'
import ATitle from '@atoms/ATitle'
import capitalize from 'lodash/capitalize'
import MField from '@molecules/MField'
import MForm from '@molecules/MForm'
import MLoanSignature from '@molecules/MLoanSignature'
import moment from 'moment'
import numeral from 'numeral'
import React, { useEffect, useMemo, useState } from 'react'

export function ClientLoanScreen({ route, navigation }) {
  const [client, setClient] = useState()
  const [loanId, setLoanId] = useState()

  useHeader({
    subtitle: client ? `${client.lastName}, ${client.firstName}` : 'Loading…',
  })

  useEffect(() => {
    if (route.params) {
      const { client, loanId } = route.params

      if (client) {
        setClient(client)
      }

      if (loanId) {
        setLoanId(loanId)
      }
    }
  }, [route.params, setClient, setLoanId])

  const { data: loan, isLoading: isLoadingLoan } = useLoanById(loanId)

  const amount = loan?.approvedAmount || loan?.requestedAmount

  const cashCollateral = amount * (loan?.cashCollateral / 100)

  const loanInsurance = amount * (loan?.loanInsurance / 100)

  const loanProcessing =
    loan?.loanProcessingFee.type === 'fixed'
      ? loan?.loanProcessingFee.value
      : amount * (loan?.loanProcessingFee.value / 100)

  const duration = useMemo(() => {
    if (loan) {
      const value = loan.duration.value

      switch (loan.duration.unit) {
        case 'week':
          return `${value} weeks`
        case 'twoWeeks':
          return `${value * 2} weeks`
        case 'month':
          return `${value} months`
      }
    }

    return ''
  }, [loan])

  return (
    <ASafeAreaView>
      {!isLoadingLoan && loan && (
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
              {capitalize(loan?.status)
                .replace('Awaitingmanagerreview', 'Pending')
                .replace('Approvedbymanager', 'Approved')
                .replace('Rejectedbymanager', 'Rejected')
                .replace('Notpaid', 'Not paid')}
            </MField>
            <MField label="Code">{loan?.code}</MField>
            <MField label="Type">{loan?.loanProductName}</MField>
            <MField label="Group">{loan?.clientGroupName}</MField>
            <MField label="Installment">
              USh {numeral(loan?.installments[0].total).format('0,0')}
            </MField>
            <MField label="Duration">{duration}</MField>
            {loan?.approvedAmount && (
              <MField label="Approved amount">
                USh {numeral(loan?.approvedAmount).format('0,0')}
              </MField>
            )}
            <MField label="Requested amount">
              USh {numeral(loan?.requestedAmount).format('0,0')}
            </MField>
            <MField label="Cycle">{loan?.cycle}</MField>
            {loan?.approvedAmount && (
              <MField label="Requested-approved">
                USh{' '}
                {numeral(loan.requestedAmount - loan.approvedAmount).format(
                  '0,0'
                )}
              </MField>
            )}
            <MField label="Security & savings">
              USh {numeral(cashCollateral).format('0,0')}
            </MField>
            <MField label="Insurance">
              USh {numeral(loanInsurance).format('0,0')}
            </MField>
            {loan?.disbursementAt && (
              <MField label="Disbursement">
                {moment(loan?.disbursementAt)
                  .tz(timezone)
                  .format('D MMMM YYYY')}
              </MField>
            )}
            <MField label="Application">
              {moment(loan?.createdAt).tz(timezone).format('D MMMM YYYY')}
            </MField>
          </View>
          <Divider />
          <View style={{ paddingLeft: 16, paddingTop: 16, paddingBottom: 0 }}>
            <ATitle>Schedule</ATitle>
            <Caption>All amounts are expressed in USh</Caption>
          </View>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title></DataTable.Title>
              <DataTable.Title
                style={{ flex: loan?.status === 'active' ? 2 : 3 }}
              >
                Due date
              </DataTable.Title>
              <DataTable.Title
                numeric
                style={{ flex: loan?.status === 'active' ? 2 : 3 }}
              >
                Installment
              </DataTable.Title>
              {loan?.status === 'active' && (
                <DataTable.Title numeric style={{ flex: 2 }}>
                  Realization
                </DataTable.Title>
              )}
            </DataTable.Header>
            {loan?.installments.map((installment, index) => (
              <DataTable.Row key={index}>
                <DataTable.Cell>{Number(index) + 1}.</DataTable.Cell>
                <DataTable.Cell
                  style={{ flex: loan?.status === 'active' ? 2 : 3 }}
                >
                  {moment(installment.due).tz(timezone).format('DD.MM.YYYY')}
                </DataTable.Cell>
                <DataTable.Cell
                  numeric
                  style={{ flex: loan?.status === 'active' ? 2 : 3 }}
                >
                  {numeral(installment.total).format('0,0')}
                </DataTable.Cell>
                {loan?.status === 'active' && (
                  <DataTable.Cell numeric style={{ flex: 2 }}>
                    {installment.realization
                      ? numeral(installment.realization).format('0,0')
                      : '—'}
                  </DataTable.Cell>
                )}
              </DataTable.Row>
            ))}
          </DataTable>
          <Divider />
          {loan?.forms && (
            <View>
              <View
                style={{ paddingLeft: 16, paddingTop: 16, paddingBottom: 0 }}
              >
                <ATitle>Forms</ATitle>
              </View>
              <List.Section>
                {loan?.forms?.inspection && (
                  <MForm
                    client={client}
                    id={loan?.forms.inspection._id}
                    navigation={navigation}
                    status={loan?.forms.inspection.status}
                    type="inspection"
                    updatedAt={loan?.forms.inspection.updatedAt}
                  />
                )}
                {loan?.forms?.application && (
                  <MForm
                    client={client}
                    id={loan?.forms.application._id}
                    navigation={navigation}
                    status={loan?.forms.application.status}
                    type="application"
                    updatedAt={loan?.forms.application.updatedAt}
                  />
                )}
              </List.Section>
            </View>
          )}
          {loan?.status === 'active' && loan?.signatures && (
            <View>
              <Divider />
              <View
                style={{ paddingLeft: 16, paddingTop: 16, paddingBottom: 0 }}
              >
                <ATitle>Signatures</ATitle>
              </View>
              <List.Section>
                <List.Subheader>Client</List.Subheader>
                <MLoanSignature
                  name={`${client.lastName}, ${client.firstName}`}
                  signature={loan?.signatures.client}
                  navigation={navigation}
                />
                <List.Subheader>Loan Officer</List.Subheader>
                <MLoanSignature
                  name={loan?.loanOfficerName}
                  signature={loan?.signatures.loanOfficer}
                  navigation={navigation}
                />
                <List.Subheader>Approving manager</List.Subheader>
                <MLoanSignature
                  name={loan?.branchManagerName}
                  signature={loan?.signatures.branchManager}
                  navigation={navigation}
                />
                <List.Subheader>Disbursement witnesses</List.Subheader>
                <MLoanSignature
                  name={loan?.signatures.witnesses[0].name}
                  signature={loan?.signatures.witnesses[0].signature}
                  navigation={navigation}
                />
                <MLoanSignature
                  name={loan?.signatures.witnesses[1].name}
                  signature={loan?.signatures.witnesses[1].signature}
                  navigation={navigation}
                />
                <MLoanSignature
                  name={loan?.signatures.witnesses[2].name}
                  signature={loan?.signatures.witnesses[2].signature}
                  navigation={navigation}
                />
              </List.Section>
            </View>
          )}
        </ScrollView>
      )}
    </ASafeAreaView>
  )
}

export default ClientLoanScreen
