import { Caption, Checkbox, Divider, List, Text } from 'react-native-paper'
import { Colors } from '@constants'
import { Controller, useForm } from 'react-hook-form'
import { ScrollView, View } from 'react-native'
import { required, useDisburseLoan, useLoanById } from 'shared'
import { useHeader } from '@hooks'
import { useQueryClient } from 'react-query'
import AActivityIndicator from '@atoms/AActivityIndicator'
import AButton from '@atoms/AButton'
import AHelperText from '@atoms/AHelperText'
import ASafeAreaView from '@atoms/ASafeAreaView'
import ATitle from '@atoms/ATitle'
import MField from '@molecules/MField'
import MFormPhoto from '@molecules/MFormPhoto'
import MFormSignature from '@molecules/MFormSignature'
import MFormRadioGroup from '@molecules/MFormRadioGroup'
import MFormWitness from '@molecules/MFormWitness'
import MGeneralErrorDialog from '@molecules/MGeneralErrorDialog'
import numeral from 'numeral'
import React, { useEffect, useMemo, useRef, useState } from 'react'

export function ClientLoanDisbursementScreen({ route, navigation }) {
  const screen = 'Client: Loan: Disbursement'

  const [loanId, setLoanId] = useState()
  const [isProcessing, setIsProcessing] = useState(false)

  const { data: loan, isLoading: isLoadingLoan } = useLoanById(loanId)

  const { mutate: disburseLoan } = useDisburseLoan()

  const queryClient = useQueryClient()

  const debugDefaultValues = {
    disbursementPhoto: {
      uri: 'https://yamafrica-dev.s3.amazonaws.com/photo/sample.jpg',
      lat: '52.218577451928226',
      lng: '21.018471056067675',
    },
    signatures: {
      client: 'https://yamafrica-dev.s3.amazonaws.com/photo/sample.jpg',
      branchManager: 'https://yamafrica-dev.s3.amazonaws.com/photo/sample.jpg',
      loanOfficer: 'https://yamafrica-dev.s3.amazonaws.com/photo/sample.jpg',
      witnesses: [
        {
          name: 'First, Firstname',
          signature: 'https://yamafrica-dev.s3.amazonaws.com/photo/sample.jpg',
        },
        {
          name: 'Second, Firstname',
          signature: 'https://yamafrica-dev.s3.amazonaws.com/photo/sample.jpg',
        },
        {
          name: 'Third, Firstname',
          signature: 'https://yamafrica-dev.s3.amazonaws.com/photo/sample.jpg',
        },
      ],
    },
  }

  const { control, errors, handleSubmit, register, setValue } = useForm({
    // defaultValues: debugDefaultValues,
  })

  register('cheque', 0)

  const scrollViewRef = useRef()

  const [generalErrorDialog, setGeneralErrorDialog] = useState(false)

  useHeader({
    subtitle: loan ? `${loan.client.lastName}, ${loan.client.firstName}` : ' ',
  })

  useEffect(() => {
    if (route.params) {
      const { loanId, photo, signature } = route.params

      if (loanId) {
        setLoanId(loanId)
      }

      if (photo) {
        setValue(`${photo.name}`, {
          uri: photo.value,
          lat: photo.lat,
          lng: photo.lng,
        })
      }

      if (signature) {
        setValue(signature.name, signature.value)
      }
    }
  }, [route.params, setLoanId, setValue])

  const cashCollateral = loan?.approvedAmount * (loan?.cashCollateral / 100)

  const loanInsurance = loan?.approvedAmount * (loan?.loanInsurance / 100)

  const loanProcessing =
    loan?.loanProcessingFee.type === 'fixed'
      ? loan?.loanProcessingFee.value
      : loan?.approvedAmount * (loan?.loanProcessingFee.value / 100)

  const securityBalance =
    cashCollateral - loan?.client?.securityBalance > 0
      ? cashCollateral - loan?.client?.securityBalance
      : 0

  const total = securityBalance + loanInsurance + loanProcessing

  const onSubmit = async data => {
    setIsProcessing(true)

    disburseLoan(
      {
        loanId,
        photo: data.disbursementPhoto,
        signatures: data.signatures,
        cheque: data.cheque === 1 ? true : false,
      },
      {
        onError: () => {
          console.log('Mutation #1: onError')

          setGeneralErrorDialog(true)
          setIsProcessing(false)
        },
        onSuccess: async () => {
          console.log('Mutation #1: onSuccess')

          queryClient.invalidateQueries('loanDisbursementsByBranchId')

          navigation.navigate('Today')
        },
      }
    )
  }

  const onError = () => {
    scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: true })
  }

  const securityBalanceLabel = `USh ${numeral(
    loan?.client?.securityBalance
  ).format('0,0')}`

  const cashCollateralLabel = `USh ${numeral(cashCollateral).format('0,0')}`

  const cashCollateralLabelExplanation = `(${loan?.cashCollateral}%)`

  const securityBalanceOrCashCollateralLabel =
    securityBalance > 0 ? securityBalanceLabel : cashCollateralLabel

  const cashCollateralIncludingSecurityBalanceLabel = `USh ${numeral(
    securityBalance
  ).format('0,0')}`

  const cashCollateralIncludingSecurityBalanceLabelExplanation = `${cashCollateralLabel} ${cashCollateralLabelExplanation} - ${securityBalanceOrCashCollateralLabel}`

  const cashCollateralWithSecurityLabel = `${cashCollateralIncludingSecurityBalanceLabel} · ${cashCollateralIncludingSecurityBalanceLabelExplanation}`

  const noSecurityBalance =
    !loan?.client?.securityBalance || loan?.client?.securityBalance === 0

  const securityDescription = noSecurityBalance
    ? cashCollateralLabel
    : cashCollateralWithSecurityLabel

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
        <ScrollView
          style={{ backgroundColor: Colors.white, flex: 1 }}
          ref={scrollViewRef}
        >
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              padding: 16,
              paddingBottom: 0,
            }}
          >
            <MField label="Type">{loan?.loanProductName}</MField>
            <MField label="Code">{loan?.code}</MField>
            <MField label="Installment">
              USh {numeral(loan?.installments[0].total).format('0,0')}
            </MField>
            <MField label="Duration">{duration}</MField>
            <MField label="Approved amount">
              USh {numeral(loan?.approvedAmount).format('0,0')}
            </MField>
            <MField label="Requested amount">
              USh {numeral(loan?.requestedAmount).format('0,0')}
            </MField>
            <MField label="Cycle">{loan?.cycle}</MField>
            <MField label="Requested-approved">
              USh{' '}
              {numeral(
                Number(
                  Number(loan?.requestedAmount) - Number(loan?.approvedAmount)
                )
              ).format('0,0')}
            </MField>
            <MField label="Group">{loan?.clientGroupName}</MField>
            <MField label="Loan Officer">
              {loan ? `${loan.loanOfficerName}` : 'Loading…'}
            </MField>
            <MField label="Security balance">
              USh {numeral(loan?.client?.securityBalance || 0).format('0,0')}
            </MField>
          </View>
          <Divider />
          <View style={{ padding: 16, paddingBottom: 0 }}>
            <ATitle>Fees</ATitle>
            <Caption>Mark the fees paid by the client</Caption>
          </View>
          {(errors?.fees?.cashCollateral ||
            errors?.fees?.loanInsurance ||
            errors?.fees?.loanProcessing) && (
            <View style={{ paddingHorizontal: 16 }}>
              <AHelperText error>The client has to pay the fees</AHelperText>
            </View>
          )}
          <View style={{ paddingBottom: 8 }}>
            <Controller
              control={control}
              render={({ onChange, onBlur, value }) => (
                <List.Item
                  title={`Security & savings ${
                    loan ? `(${loan?.cashCollateral}%)` : ''
                  }`}
                  description={securityDescription}
                  left={() => (
                    <Checkbox
                      status={value ? 'checked' : 'unchecked'}
                      color={Colors.green}
                      onBlur={onBlur}
                    />
                  )}
                  onPress={() => onChange(!value)}
                />
              )}
              name="fees.cashCollateral"
              rules={{ required: true }}
              defaultValue=""
            />
            <Controller
              control={control}
              render={({ onChange, onBlur, value }) => (
                <List.Item
                  title={`Loan insurance ${
                    loan ? `(${loan?.loanInsurance}%)` : ''
                  }`}
                  description={`USh ${numeral(loanInsurance).format('0,0')}`}
                  left={() => (
                    <Checkbox
                      status={value ? 'checked' : 'unchecked'}
                      color={Colors.green}
                      onBlur={onBlur}
                    />
                  )}
                  onPress={() => onChange(!value)}
                />
              )}
              name="fees.loanInsurance"
              rules={{ required: true }}
              defaultValue=""
            />
            <Controller
              control={control}
              render={({ onChange, onBlur, value }) => (
                <List.Item
                  title={`Loan processing ${
                    loan?.loanProcessingFee.type === 'percentage'
                      ? `(${loan.loanProcessingFee.value}%)`
                      : ''
                  }`}
                  description={`USh ${numeral(loanProcessing).format('0,0')}`}
                  left={() => (
                    <Checkbox
                      status={value ? 'checked' : 'unchecked'}
                      color={Colors.green}
                      onBlur={onBlur}
                    />
                  )}
                  onPress={() => onChange(!value)}
                />
              )}
              name="fees.loanProcessing"
              rules={{ required: true }}
              defaultValue=""
            />
          </View>
          <View style={{ padding: 16, paddingTop: 0 }}>
            <Caption>Total: USh {numeral(total).format('0,0')}</Caption>
          </View>
          {loan?.loanProduct.disbursementAllowCheques === true && (
            <View>
              <Divider />
              <View style={{ padding: 16, paddingBottom: 0 }}>
                <ATitle>Disbursement</ATitle>
                <MFormRadioGroup
                  label="Method"
                  name="cheque"
                  defaultValue={0}
                  items={[
                    { value: 1, label: 'Cheque' },
                    { value: 0, label: 'Cash' },
                  ]}
                  control={control}
                  errors={errors}
                  rules={{}}
                />
              </View>
            </View>
          )}
          <Divider />
          <View style={{ padding: 16, paddingBottom: 8 }}>
            <ATitle>Photo</ATitle>
            <MFormPhoto
              label={false}
              context="Disbursement"
              name="disbursementPhoto"
              control={control}
              errors={errors}
              screen={screen}
              navigation={navigation}
            />
          </View>
          <Divider />
          <View style={{ padding: 16 }}>
            <ATitle>Signatures</ATitle>
            <MFormSignature
              label="Client"
              name="signatures.client"
              sign="Take a signature"
              control={control}
              errors={errors}
              screen={screen}
              navigation={navigation}
              fingerprint
            />
            <MFormSignature
              label="Manager"
              name="signatures.branchManager"
              control={control}
              errors={errors}
              screen={screen}
              navigation={navigation}
            />
            <MFormSignature
              label="Loan Officer"
              name="signatures.loanOfficer"
              control={control}
              errors={errors}
              screen={screen}
              navigation={navigation}
            />
            <MFormWitness
              number="1"
              control={control}
              errors={errors}
              screen={screen}
              navigation={navigation}
            />
            <MFormWitness
              number="2"
              control={control}
              errors={errors}
              screen={screen}
              navigation={navigation}
            />
            <MFormWitness
              number="3"
              control={control}
              errors={errors}
              screen={screen}
              navigation={navigation}
            />
          </View>
          <Divider />
          <View style={{ padding: 16 }}>
            {isProcessing && (
              <View style={{ padding: 8 }}>
                <AActivityIndicator />
              </View>
            )}
            {!isProcessing && (
              <AButton
                mode="contained"
                onPress={handleSubmit(onSubmit, onError)}
              >
                Mark loan as disbursed
              </AButton>
            )}
          </View>
        </ScrollView>
      )}
      <MGeneralErrorDialog
        visible={generalErrorDialog}
        onDismiss={() => setGeneralErrorDialog(false)}
      />
    </ASafeAreaView>
  )
}

export default ClientLoanDisbursementScreen
