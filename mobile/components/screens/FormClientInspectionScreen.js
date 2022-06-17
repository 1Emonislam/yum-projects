import * as Sentry from 'sentry-expo'
import { Appbar, Divider, Portal, Text } from 'react-native-paper'
import { Colors } from '@constants'
import { Dimensions, ScrollView, View } from 'react-native'
import {
  dateInvalid,
  dateFormat,
  frequencyToDurationUnit,
  generateInstallments,
  generateInstallmentsStartDate,
  getFormsCount,
  loanAmountTooLarge,
  required,
  sanitize,
  useFormById,
  useHolidays,
  useInsertEvent,
  useLoanProducts,
  useAuth,
} from 'shared'
import { ObjectId } from 'bson'
import { useForm } from 'react-hook-form'
import { useQueryClient } from 'react-query'
import * as Location from 'expo-location'
import AActivityIndicator from '@atoms/AActivityIndicator'
import AButton from '@atoms/AButton'
import ASafeAreaView from '@atoms/ASafeAreaView'
import ASnackbar from '@atoms/ASnackbar'
import AsyncStorage from '@react-native-async-storage/async-storage'
import ATitle from '@atoms/ATitle'
import MFormCurrency from '@molecules/MFormCurrency'
import MFormGuarantor from '@molecules/MFormGuarantor'
import MFormPhoto from '@molecules/MFormPhoto'
import MFormRadioGroup from '@molecules/MFormRadioGroup'
import MFormSignature from '@molecules/MFormSignature'
import MFormText from '@molecules/MFormText'
import MDraftErrorDialog from '@molecules/MDraftErrorDialog'
import MGeneralErrorDialog from '@molecules/MGeneralErrorDialog'
import MLocationErrorDialog from '@molecules/MLocationErrorDialog'
import moment from 'moment-timezone'
import numeral from 'numeral'
import omit from 'lodash/omit'
import React, { useEffect, useMemo, useState } from 'react'
import { useHeader, useScrollToTopOnError } from '@hooks'

export function FormClientInspectionScreen({ route, navigation }) {
  const screen = 'Form: Client Inspection'

  const [locationsStart, setLocationsStart] = useState()
  const [client, setClient] = useState()
  const [clientProfile, setClientProfile] = useState()
  const [loanApplicationFormId, setLoanApplicationFormId] = useState(
    new ObjectId()
  )
  const [group, setGroup] = useState()
  const [
    isLoadingValuesFromLoanApplicationForm,
    setIsLoadingValuesFromLoanApplicationForm,
  ] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [snackbar, setSnackbar] = useState(false)
  const [snackbarText, setSnackbarText] = useState()
  const [formId, setFormId] = useState()
  const [draftToBeLoaded, setDraftToBeLoaded] = useState()
  const [readOnly, setReadOnly] = useState(false)
  const [isLoadingValues, setIsLoadingValues] = useState(false)

  const {
    _id: branchManagerId,
    firstName: branchManagerFirstName,
    lastName: branchManagerLastName,
  } = useAuth()

  const { data: holidays } = useHolidays()

  const { data: rawLoanProducts = [], isLoading: isLoadingLoanProducts } =
    useLoanProducts()

  const frequency = useMemo(() => {
    return group?.frequency
  }, [group])

  const loanProducts = useMemo(() => {
    if (rawLoanProducts && frequency) {
      return rawLoanProducts.filter(loanProduct => {
        const loanProductIsCompatibleWithClientGroupMeetingFrequency =
          loanProduct.durations[frequency] &&
          loanProduct.durations[frequency].length > 0

        return loanProductIsCompatibleWithClientGroupMeetingFrequency
      })
    }

    return []
  }, [rawLoanProducts, frequency])

  const { data: loanApplicationForm, isLoading: isLoadingLoanApplicationForm } =
    useFormById(loanApplicationFormId)

  const { data: form, isLoading: isLoadingForm } = useFormById(formId)

  const { mutate: mutateSubmission } = useInsertEvent()

  const queryClient = useQueryClient()

  // const defaultValues = {
  //   content: {
  //     loan: {
  //       type: '',
  //       duration: {
  //         value: '',
  //         unit: '',
  //       },
  //       cycle: '1',
  //       amount: '',
  //     },
  //     occupation: '',
  //     dateOfBirth: '',
  //     sex: 'female',
  //     fatherOrHusbandName: '',
  //     mobilePhoneNumber: '',
  //     nationalVoterIdNumber: '',
  //     nationalVoterIdPhoto: {
  //       uri: '',
  //       lat: '',
  //       lng: '',
  //     },
  //     photo: {
  //       uri: '',
  //       lat: '',
  //       lng: '',
  //     },
  //     residence: {
  //       area: '',
  //       subcounty: '',
  //       county: '',
  //       district: '',
  //       notes: '',
  //     },
  //     work: {
  //       area: '',
  //       subcounty: '',
  //       county: '',
  //       district: '',
  //       notes: '',
  //     },
  //     previousLoan: {
  //       amount: '',
  //       cycle: '',
  //       purpose: '',
  //     },
  //     projects: ['', ''],
  //   },
  //   signatures: {
  //     client: '',
  //     employee: '',
  //   },
  // }

  // const debugDefaultValues = {
  //   content: {
  //     loan: {
  //       duration: {
  //         value: 6,
  //         unit: 'month',
  //       },
  //       cycle: '1',
  //       amount: '250001',
  //     },
  //     inspection: [
  //       {
  //         uri: 'https://yamafrica-dev.s3.amazonaws.com/photo/sample.jpg',
  //         lat: '52.218577451928226',
  //         lng: '21.018471056067675',
  //       },
  //       {
  //         uri: 'https://yamafrica-dev.s3.amazonaws.com/photo/sample.jpg',
  //         lat: '52.218577451928226',
  //         lng: '21.018471056067675',
  //       },
  //     ],
  //     occupation: 'Occupation',
  //     dateOfBirth: '01/01/1970',
  //     sex: 'male',
  //     fatherOrHusbandName: 'Name',
  //     mobilePhoneNumber: '+48530830807',
  //     nationalVoterIdNumber: '1234567891234',
  //     nationalVoterIdPhoto: {
  //       uri: 'https://yamafrica-dev.s3.amazonaws.com/photo/sample.jpg',
  //       lat: '52.218577451928226',
  //       lng: '21.018471056067675',
  //     },
  //     photo: {
  //       uri: 'https://yamafrica-dev.s3.amazonaws.com/photo/sample.jpg',
  //       lat: '52.218577451928226',
  //       lng: '21.018471056067675',
  //     },
  //     loanRequirements: [
  //       {
  //         uri: 'https://yamafrica-dev.s3.amazonaws.com/photo/sample.jpg',
  //         lat: '52.218577451928226',
  //         lng: '21.018471056067675',
  //       },
  //       {
  //         uri: 'https://yamafrica-dev.s3.amazonaws.com/photo/sample.jpg',
  //         lat: '52.218577451928226',
  //         lng: '21.018471056067675',
  //       },
  //       {
  //         uri: 'https://yamafrica-dev.s3.amazonaws.com/photo/sample.jpg',
  //         lat: '52.218577451928226',
  //         lng: '21.018471056067675',
  //       },
  //       {
  //         uri: 'https://yamafrica-dev.s3.amazonaws.com/photo/sample.jpg',
  //         lat: '52.218577451928226',
  //         lng: '21.018471056067675',
  //       },
  //     ],
  //     residence: {
  //       area: 'Residence Village/Area',
  //       subcounty: 'Residence Sub–county',
  //       county: 'Residence County',
  //       district: 'Residence District/Division',
  //       notes: 'Residence Notes',
  //     },
  //     work: {
  //       area: 'Work Village/Area',
  //       subcounty: 'Work Sub–county',
  //       county: 'Work County',
  //       district: 'Work District/Division',
  //       notes: '',
  //     },
  //     previousLoan: {
  //       amount: '0',
  //       cycle: '',
  //       purpose: '',
  //     },
  //     projects: ['Project #1', 'Project #2'],
  //     guarantors: [
  //       {
  //         name: 'Firstname First',
  //         relation: 'Sister',
  //         nationalVoterIdNumber: '1234567891234',
  //         nationalVoterIdPhoto: {
  //           uri: 'https://yamafrica-dev.s3.amazonaws.com/photo/sample.jpg',
  //           lat: '52.218577451928226',
  //           lng: '21.018471056067675',
  //         },
  //         photo: {
  //           uri: 'https://yamafrica-dev.s3.amazonaws.com/photo/sample.jpg',
  //           lat: '52.218577451928226',
  //           lng: '21.018471056067675',
  //         },
  //         signature: 'https://yamafrica-dev.s3.amazonaws.com/photo/sample.jpg',
  //       },
  //       {
  //         name: 'Firstname Second',
  //         relation: 'Group',
  //         nationalVoterIdNumber: '1234567891234',
  //         nationalVoterIdPhoto: {
  //           uri: 'https://yamafrica-dev.s3.amazonaws.com/photo/sample.jpg',
  //           lat: '52.218577451928226',
  //           lng: '21.018471056067675',
  //         },
  //         photo: {
  //           uri: 'https://yamafrica-dev.s3.amazonaws.com/photo/sample.jpg',
  //           lat: '52.218577451928226',
  //           lng: '21.018471056067675',
  //         },
  //         signature: 'https://yamafrica-dev.s3.amazonaws.com/photo/sample.jpg',
  //       },
  //     ],
  //   },
  //   signatures: {
  //     client: 'https://yamafrica-dev.s3.amazonaws.com/photo/sample.jpg',
  //     employee: 'https://yamafrica-dev.s3.amazonaws.com/photo/sample.jpg',
  //   },
  // }

  const {
    control,
    errors,
    handleSubmit,
    getValues,
    register,
    setValue,
    watch,
  } = useForm({
    // defaultValues: debugDefaultValues
  })

  const draft = watch()
  const loanType = watch('content.loan.type', '')
  const loanDurationValue = watch('content.loan.duration.value')
  const loanDurationUnit = watch('content.loan.duration.unit')
  const cycle = watch('content.loan.cycle')
  const amount = watch('content.loan.amount')

  useEffect(() => {
    if (frequency) {
      register('content.loan.duration.unit', frequencyToDurationUnit(frequency))
      setValue('content.loan.duration.unit', frequencyToDurationUnit(frequency))
    }
  }, [frequency, register, setValue])

  const durations = useMemo(() => {
    if (loanProducts.length && loanType !== '' && frequency) {
      return loanProducts.find(p => p._id === loanType).durations[frequency]
    }

    return undefined
  }, [loanProducts, loanType, frequency])

  const interestRate = useMemo(() => {
    let result

    if (
      loanProducts.length &&
      loanType !== '' &&
      loanDurationValue &&
      loanDurationUnit &&
      frequency
    ) {
      const isLoanTypeDurationMixValid = loanProducts
        .find(p => p._id === loanType)
        .durations[frequency].includes(loanDurationValue)

      if (isLoanTypeDurationMixValid) {
        result = loanProducts
          .find(p => p._id === loanType)
          .serviceCharges.find(
            s =>
              s.durationValue === loanDurationValue &&
              s.durationUnit === loanDurationUnit
          ).charge
      }
    }

    return result
  }, [loanProducts, loanType, loanDurationValue, loanDurationUnit, frequency])

  const amountRange = useMemo(() => {
    let result

    if (
      loanProducts.length &&
      loanType !== '' &&
      loanDurationValue &&
      loanDurationUnit &&
      cycle &&
      frequency
    ) {
      const isLoanTypeDurationMixValid = loanProducts
        .find(p => p._id === loanType)
        .durations[frequency].includes(loanDurationValue)

      if (isLoanTypeDurationMixValid) {
        const { from: initialFrom, to: initialTo } = loanProducts
          .find(p => p._id === loanType)
          .initialLoan.find(
            l =>
              l.durationValue === loanDurationValue &&
              l.durationUnit === loanDurationUnit
          )

        if (cycle === '1') {
          result = { from: initialFrom, to: initialTo }
        } else {
          const { to: incrementTo } = loanProducts
            .find(p => p._id === loanType)
            .loanIncrementEachCycle.find(
              l =>
                l.durationValue === loanDurationValue &&
                l.durationUnit === loanDurationUnit
            )

          const limit = loanProducts
            .find(p => p._id === loanType)
            .limits.find(
              l =>
                l.durationValue === loanDurationValue &&
                l.durationUnit === loanDurationUnit
            ).limit

          let from = initialFrom

          let to = Number(initialTo) + Number(incrementTo) * Number(cycle)

          if (to > limit) {
            to = limit
          }

          result = { from, to }
        }
      }
    }

    return result
  }, [
    loanProducts,
    loanType,
    loanDurationValue,
    loanDurationUnit,
    cycle,
    frequency,
  ])

  const amountToRepay = useMemo(() => {
    let result = 0

    if (interestRate) {
      result =
        Number(amount || 0) +
        Number(Number(amount || 0) * Number(interestRate / 100))
    }

    return numeral(result).format('0,0')
  }, [amount, interestRate])

  const requiredDocuments = useMemo(() => {
    let result

    if (loanProducts.length && loanType !== '') {
      const documents = loanProducts.find(
        p => p._id === loanType
      ).requiredDocuments

      if (!cycle || Number(cycle) < 2) {
        result = documents.initialLoan
      } else {
        result = documents.furtherLoans
      }
    }

    return result
  }, [loanProducts, loanType, cycle])

  const requiredGuarantors = useMemo(() => {
    let result

    if (loanProducts.length && loanType !== '') {
      const { family, group } = loanProducts.find(
        p => p._id === loanType
      ).requiredGuarantors

      const numberOfGuarantors = Number(family || 0) + Number(group || 0)

      result = [...Array(numberOfGuarantors).keys()].map(index => {
        if (index < family) {
          return 'family'
        }

        return 'group'
      })
    }

    return result
  }, [loanProducts, loanType])

  const {
    scrollViewRef,
    renderErrorMessage,
    scrollToTopErrorHandler: onError,
  } = useScrollToTopOnError()

  const [draftErrorDialog, setDraftErrorDialog] = useState(false)
  const [generalErrorDialog, setGeneralErrorDialog] = useState(false)
  const [locationErrorDialog, setLocationErrorDialog] = useState(false)

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync()

    if (status === 'granted') {
      let location
      let locationSuccess = false
      let locationError = false
      let locationErrorCatched
      let executionTimeInSeconds = 0

      const locationStartTime = new Date()

      while (!locationSuccess && !locationError) {
        try {
          location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          })

          locationSuccess = true
        } catch (error) {
          locationErrorCatched = error
        }

        executionTimeInSeconds = (new Date() - locationStartTime) / 1000

        if (executionTimeInSeconds >= 30) {
          locationError = true
        }
      }

      if (locationError) {
        setLocationErrorDialog(true)

        Sentry.Native.captureException(locationErrorCatched, scope => {
          scope.setTransactionName('FormClientInspection.location')
          scope.setContext(
            'error',
            locationErrorCatched || 'More than 30 seconds to get the location'
          )
          scope.setContext(
            'executionTimeInSeconds',
            String(executionTimeInSeconds)
          )
          scope.setUser({ id: branchManagerId })
        })

        return { lat: null, lng: null }
      }

      const { latitude, longitude } = location.coords

      return { lat: String(latitude), lng: String(longitude) }
    }

    setLocationErrorDialog(true)
    Sentry.Native.captureMessage('Not authorized to use location services')
    console.log('Not authorized to use location services')

    return { lat: null, lng: null }
  }

  const generateFormCode = async () => {
    const formsCount = await getFormsCount()

    return ['F', String(Number(formsCount + 1)).padStart(3, '0')].join('')
  }

  useEffect(() => {
    // eslint-disable-next-line
    ;(async () => {
      if (!locationsStart?.lat) {
        const { lat, lng } = await getLocation()

        if (lat !== null) {
          setLocationsStart({ lat, lng })
        }
      }
    })()
  }, [locationErrorDialog])

  const onSaveDraft = async () => {
    setIsProcessing(true)

    try {
      await AsyncStorage.setItem(
        ['clientInspection', client._id].join(''),
        JSON.stringify(draft)
      )

      setIsProcessing(false)

      navigation.navigate('Today')
    } catch (e) {
      console.error(e)

      setIsProcessing(false)

      setDraftErrorDialog(true)
    }
  }

  const approve = async data => {
    setIsProcessing(true)

    await onSubmit(data, 'approved')
  }

  const reject = async data => {
    setIsProcessing(true)

    await onSubmit(data, 'rejected')
  }

  const onSubmit = async (data, status) => {
    try {
      await AsyncStorage.setItem(
        ['clientInspection', client._id].join(''),
        JSON.stringify(draft)
      )
    } catch (e) {
      console.log('Draft could not be saved')
    }

    const code = await generateFormCode()

    const locationsSubmission = await getLocation()

    if (locationsSubmission.lat === null) {
      setIsProcessing(false)

      return
    }

    const {
      content: dataContent,
      feedback: dataFeedback,
      ...dataRest
    } = sanitize(omit(data, ['consent']))

    const {
      dateOfBirth: dataContentDateOfBirth,
      loan: dataContentLoan,
      loanRequirements: dataContentLoanRequirements,
      ...dataContentRest
    } = dataContent

    const cashCollateralOptions = loanProducts.find(
      p => p._id === loanType
    ).cashCollateral

    const cashCollateral =
      Number(dataContentLoan.cycle) === 1
        ? Number(cashCollateralOptions.initialLoan)
        : Number(cashCollateralOptions.furtherLoans)

    const loanProduct = loanProducts.find(p => p._id === loanType)

    const loanRequirements = dataContentLoanRequirements
      ? {
          loanRequirements: dataContentLoanRequirements.map(
            (requirement, i) => {
              return {
                requirement: requiredDocuments[i]._id,
                name: requiredDocuments[i].name,
                ...requirement,
              }
            }
          ),
        }
      : {}

    const feedback = loanApplicationForm.feedback
      ? { feedbackId: loanApplicationForm.feedback._id }
      : {}

    const loanGracePeriod = loanProduct.gracePeriods.find(
      g =>
        g.durationValue === dataContentLoan.duration.value &&
        g.durationUnit === dataContentLoan.duration.unit
    ).gracePeriodDays

    mutateSubmission(
      {
        type: 'create',
        obj: 'form',
        status,
        loanId: loanApplicationForm.loan._id,
        formType: 'inspection',
        locations: {
          start: locationsStart,
          submission: locationsSubmission,
        },
        clientId: client._id,
        relatedFormId: loanApplicationFormId,
        code: code,
        content: {
          loan: {
            ...dataContentLoan,
            interestRate,
            name: loanProduct.name,
            cashCollateral,
            // product: loanProducts.find(p => p._id === loanType), // TODO: Handle this
          },
          dateOfBirth: moment(dataContentDateOfBirth, 'DD/MM/YYYY').toDate(),
          ...loanRequirements,
          ...dataContentRest,
        },
        ...dataRest,
        ...feedback,
      },
      {
        onError: (error, variables) => {
          console.log('Mutation #1: onError')

          setGeneralErrorDialog(true)
          setIsProcessing(false)

          Sentry.Native.captureException(error, scope => {
            scope.setTransactionName('FormClientInspection.mutation_1')
            scope.setContext('error', error)
            scope.setContext(
              'variables',
              omit(variables, ['content.guarantors', 'signatures'])
            )
          })
        },
        onSuccess: data => {
          console.log('Mutation #1: onSuccess')

          queryClient.invalidateQueries('clientsInspections')
          queryClient.invalidateQueries('loanDisbursementsByBranchId')

          const clientInspectionFormId = data.addEvent.objId

          const conditionalPayload =
            status === 'approved'
              ? {
                  approvedAmount: dataContentLoan.amount,
                  installments: generateInstallments({
                    principal: dataContentLoan.amount,
                    duration: dataContentLoan.duration,
                    interestRateInPercents: interestRate,
                    startDate: generateInstallmentsStartDate({
                      dayOfWeek: group.dayOfWeek,
                      frequency: group.frequency,
                      clientGroupStartedAt: group.startedAt,
                      firstLoanDisbursement: loanProduct.firstLoanDisbursement,
                      gracePeriod: loanGracePeriod,
                    }),
                    holidays,
                  }),
                }
              : {}

          mutateSubmission(
            {
              _id: loanApplicationForm.loan._id,
              type: 'update',
              obj: 'loan',
              branchManagerId,
              branchManagerName: `${branchManagerLastName}, ${branchManagerFirstName}`,
              cashCollateral,
              cycle: dataContentLoan.cycle,
              duration: dataContentLoan.duration,
              forms: {
                application: loanApplicationFormId,
                inspection: clientInspectionFormId,
              },
              interestRate,
              loanInsurance: loanProduct.loanInsurance,
              loanProcessingFee: loanProduct.loanProcessingFee,
              loanProductId: loanType,
              loanProductName: loanProduct.name,
              loanGracePeriod,
              status: status
                .replace('approved', 'approvedByManager')
                .replace('rejected', 'rejectedByManager'),
              managerDecisionAt: moment().toDate(),
              ...conditionalPayload,
            },
            {
              onError: (error, variables) => {
                console.log('Mutation #2: onError')

                setGeneralErrorDialog(true)
                setIsProcessing(false)

                Sentry.Native.captureException(error, scope => {
                  scope.setTransactionName('FormClientInspection.mutation_2')
                  scope.setContext('error', error)
                  scope.setContext('variables', variables)
                })
              },
              onSuccess: () => {
                console.log('Mutation #2: onSuccess')

                const conditionalClientPayload =
                  status === 'rejected'
                    ? {
                        status: 'toSurvey',
                      }
                    : {}

                mutateSubmission(
                  {
                    _id: client._id,
                    type: 'update',
                    obj: 'client',
                    photo: dataContentRest.photo.uri,
                    ...conditionalClientPayload,
                  },
                  {
                    onError: (error, variables) => {
                      console.log('Mutation #3: onError')

                      setGeneralErrorDialog(true)
                      setIsProcessing(false)

                      Sentry.Native.captureException(error, scope => {
                        scope.setTransactionName(
                          'FormClientInspection.mutation_3'
                        )
                        scope.setContext('error', error)
                        scope.setContext('variables', variables)
                      })
                    },
                    onSuccess: async () => {
                      console.log('Mutation #3: onSuccess')

                      if (!loanApplicationForm.feedback) {
                        console.log('Missing feedback')

                        queryClient.invalidateQueries('clientsInspections')
                        queryClient.invalidateQueries(
                          'loanDisbursementsByBranchId'
                        )

                        try {
                          await AsyncStorage.removeItem(
                            ['clientInspection', client._id].join('')
                          )
                        } catch (e) {
                          console.log('Draft could not be removed')
                        }

                        if (group.forms.length === 1) {
                          navigation.navigate('Today')
                        } else {
                          navigation.navigate('Inspections', {
                            group,
                          })
                        }
                      }

                      mutateSubmission(
                        {
                          type: 'update',
                          obj: 'feedback',
                          _id: loanApplicationForm.feedback._id,
                          answer: dataFeedback.answer,
                          comment: dataFeedback.comment || '',
                        },
                        {
                          onError: (error, variables) => {
                            console.log('Mutation #4: onError')

                            setGeneralErrorDialog(true)
                            setIsProcessing(false)

                            Sentry.Native.captureException(error, scope => {
                              scope.setTransactionName(
                                'FormClientInspection.mutation_4'
                              )
                              scope.setContext('error', error)
                              scope.setContext('variables', variables)
                            })
                          },
                          onSuccess: async () => {
                            console.log('Mutation #4: onSuccess')

                            queryClient.invalidateQueries('clientsInspections')
                            queryClient.invalidateQueries(
                              'loanDisbursementsByBranchId'
                            )

                            try {
                              await AsyncStorage.removeItem(
                                ['clientInspection', client._id].join('')
                              )
                            } catch (e) {
                              console.log('Draft could not be removed')
                            }

                            if (group.forms.length === 1) {
                              navigation.navigate('Today')
                            } else {
                              navigation.navigate('Inspections', {
                                group,
                              })
                            }
                          },
                        }
                      )
                    },
                  }
                )
              },
            }
          )
        },
      }
    )
  }

  useEffect(() => {
    const loadDraftFromAsyncStorage = async () => {
      try {
        const value = await AsyncStorage.getItem(
          ['clientInspection', route.params.client._id].join('')
        )

        if (value !== null) {
          const draft = JSON.parse(value)

          setDraftToBeLoaded(draft)
        }
      } catch (e) {
        console.error(e)
      }
    }

    if (route.params) {
      const {
        client,
        loanApplicationFormId,
        draft,
        formId,
        group,
        clientProfile,
        signature,
        photo,
        snackbar,
      } = route.params

      if (client) {
        setClient(client)
      }

      if (loanApplicationFormId) {
        setLoanApplicationFormId(loanApplicationFormId)
      }

      if (group) {
        setGroup(group)
      }

      if (clientProfile) {
        setClientProfile(true)
      }

      if (formId) {
        setFormId(formId)
        setReadOnly(true)
        setIsLoadingValues(true)
      }

      if (signature) {
        setValue(signature.name, signature.value)
      }

      if (photo) {
        setValue(`${photo.name}`, {
          uri: photo.value,
          lat: photo.lat,
          lng: photo.lng,
        })
      }

      if (snackbar) {
        setSnackbar(true)
        setSnackbarText(snackbar)
      }

      if (draft && !draftToBeLoaded) {
        setIsLoadingValues(true)
        loadDraftFromAsyncStorage()
      }
    }
  }, [
    draftToBeLoaded,
    route.params,
    setClient,
    setLoanApplicationFormId,
    setFormId,
    setReadOnly,
    setIsLoadingValues,
    setClientProfile,
    setValue,
  ])

  const activeLoanProducts = loanProducts.filter(
    product => product.status === 'active'
  )

  const visibleLoanProducts = readOnly ? loanProducts : activeLoanProducts

  useEffect(() => {
    if (loanProducts.length && getValues('content.loan.type') === '') {
      if (readOnly) {
        setValue('content.loan.type', loanProducts[0]._id)
      } else {
        setValue('content.loan.type', activeLoanProducts[0]._id)
      }
    }
  }, [loanProducts, getValues, setValue])

  useEffect(() => {
    if (loanType && durations) {
      setValue('content.loan.duration.value', durations[0])
    }
  }, [loanType, getValues, setValue, durations])

  const iterate = (input, property) => {
    Object.keys(input).forEach(key => {
      const value = input[key]

      const name = String(`${property}.${key}`).replace(/.([0-9*])/g, '[$1]')

      if (value !== null) {
        if (typeof value === 'object' && !Array.isArray(value)) {
          if (Object.prototype.hasOwnProperty.call(value, 'uri')) {
            value.lat = String(value.lat)
            value.lng = String(value.lng)

            setValue(
              String(`${property}.${key}`).replace(/.([0-9*])/g, '[$1]'),
              value
            )
          } else {
            iterate(value, `${property}.${key}`)
          }
        } else if (typeof value === 'object' && Array.isArray(value)) {
          iterate(value, `${property}.${key}`)
        }
      } else {
        setValue(name, '')
      }
    })
  }

  useEffect(() => {
    if (loanType === '' && loanApplicationForm) {
      setValue('content', loanApplicationForm.content)
    }

    if (
      isLoadingValuesFromLoanApplicationForm &&
      loanType &&
      durations &&
      loanApplicationForm
    ) {
      console.log('Load data')

      // Load all of the fields except the photos and date of birth

      setValue('content', loanApplicationForm.content)

      // Load date of birth

      setValue(
        'content.dateOfBirth',
        moment(loanApplicationForm.content.dateOfBirth).format('DD/MM/YYYY')
      )

      // Fill in the photos

      iterate(loanApplicationForm.content, 'content')

      // Load the feedback answer and comment

      if (loanApplicationForm.feedback) {
        if (loanApplicationForm.feedback.answer) {
          setValue(
            'feedback.answer',
            Number(loanApplicationForm.feedback.answer)
          )
        }

        if (loanApplicationForm.feedback.comment) {
          setValue('feedback.comment', loanApplicationForm.feedback.comment)
        }
      }

      // Mark the loan application form as loaded

      setIsLoadingValuesFromLoanApplicationForm(false)
    }
  }, [
    durations,
    isLoadingValuesFromLoanApplicationForm,
    iterate,
    loanApplicationForm,
    loanType,
    setIsLoadingValuesFromLoanApplicationForm,
    setValue,
  ])

  useEffect(() => {
    if (formId) {
      if (loanType === '' && form) {
        setValue('content', form.content)
      }

      if (isLoadingValues && loanType && durations && form) {
        console.log('Load data')

        // Load all of the fields except the photos and date of birth

        setValue('content', form.content)

        // Load date of birth

        setValue(
          'content.dateOfBirth',
          moment(form.content.dateOfBirth).format('DD/MM/YYYY')
        )

        // Fill in the photos

        iterate(form.content, 'content')

        // Fill in the signatures

        setValue('signatures', form.signatures)

        // Mark the loan application form as loaded

        setIsLoadingValues(false)
      }
    }
  }, [
    durations,
    form,
    formId,
    isLoadingValues,
    iterate,
    loanType,
    setIsLoadingValues,
    setValue,
  ])

  useEffect(() => {
    if (isLoadingValues && loanType && durations && draftToBeLoaded) {
      setIsLoadingValues(true)

      // Load all of the fields except the photos, consent, and feedback

      setValue('content', draftToBeLoaded.content)

      // Load consent

      setValue('consent', draftToBeLoaded.consent)

      // Load feedback

      setValue('feedback', draftToBeLoaded.feedback)

      // Fill in the photos

      iterate(draftToBeLoaded.content, 'content')

      // Fill in the signatures

      setValue('signatures', draftToBeLoaded.signatures)

      // Mark the loan application form as loaded

      setIsLoadingValues(false)
    }
  }, [
    durations,
    draftToBeLoaded,
    isLoadingValues,
    iterate,
    loanType,
    setIsLoadingValues,
    setValue,
  ])

  useHeader({
    subtitle: `${client ? `${client.lastName}, ${client.firstName}` : ''}`,
    actions: clientProfile && (
      <Appbar.Action
        color={Colors.black}
        icon="clients"
        onPress={() => navigation.navigate('Client', { clientId: client._id })}
      />
    ),
  })

  return (
    <ASafeAreaView>
      <ScrollView
        style={{ backgroundColor: Colors.white, flex: 1 }}
        ref={scrollViewRef}
      >
        {renderErrorMessage()}
        <View style={{ padding: 16 }}>
          <ATitle>Loan</ATitle>
          {(isLoadingLoanProducts ||
            isLoadingLoanApplicationForm ||
            isLoadingValues) && (
            <View
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: Dimensions.get('screen').height * 0.75,
              }}
            >
              <AActivityIndicator />
            </View>
          )}
          {!isLoadingLoanProducts && !isLoadingLoanApplicationForm && (
            <View>
              {!readOnly && loanApplicationForm.feedback && (
                <View>
                  <MFormRadioGroup
                    label={loanApplicationForm?.feedback?.label}
                    helperText={loanApplicationForm?.feedback?.question}
                    helperTextLong
                    name="feedback.answer"
                    items={[
                      { value: 1, label: 'Yes' },
                      { value: 0, label: 'No' },
                    ]}
                    control={control}
                    errors={errors}
                    readOnly={readOnly}
                    rules={{
                      required: { value: true, message: required },
                      setValueAs: value => String(value),
                    }}
                  />
                  <View style={{ paddingBottom: 16 }}>
                    <MFormText
                      label="Comments about the new offer"
                      name="feedback.comment"
                      multiline
                      control={control}
                      errors={errors}
                      readOnly={readOnly}
                      rules={{}} // Optional
                    />
                  </View>
                </View>
              )}
              <MFormRadioGroup
                label="Type"
                name="content.loan.type"
                items={
                  visibleLoanProducts
                    ? visibleLoanProducts.map(product => {
                        return {
                          value: product._id,
                          label: product.name,
                        }
                      })
                    : undefined
                }
                control={control}
                errors={errors}
                readOnly={readOnly}
              />
              <MFormRadioGroup
                label="Duration"
                name="content.loan.duration.value"
                items={
                  durations
                    ? durations.map(duration => {
                        let label = 'Error'

                        switch (frequency) {
                          case 'weekly':
                            label = `${duration} weeks`
                            break
                          case 'biweekly':
                            label = `${duration * 2} weeks`
                            break
                          case 'monthly':
                            label = `${duration} months`
                            break
                        }

                        return {
                          value: duration,
                          label,
                        }
                      })
                    : undefined
                }
                control={control}
                errors={errors}
                readOnly={readOnly}
              />
              <View style={{ paddingTop: 12, paddingBottom: 8 }}>
                <Text>
                  Interest rate:{' '}
                  {interestRate ? `${interestRate}%` : 'Loading…'}
                </Text>
              </View>
              <MFormText
                label="Cycle"
                name="content.loan.cycle"
                keyboardType="numeric"
                control={control}
                errors={errors}
                readOnly={readOnly}
                rules={{
                  required: { value: true, message: required },
                  valueAsNumber: true,
                }}
              />
              <MFormCurrency
                label="Amount"
                name="content.loan.amount"
                control={control}
                errors={errors}
                helperText={
                  amountRange
                    ? [
                        'USh ',
                        numeral(amountRange.from).format('0,0'),
                        '–',
                        numeral(amountRange.to).format('0,0'),
                      ].join('')
                    : ' '
                }
                rules={{
                  required: { value: true, message: required },
                  validate: value =>
                    amountRange
                      ? Number(value) <= amountRange.to || loanAmountTooLarge
                      : true,
                  valueAsNumber: true,
                }}
                readOnly={readOnly}
              />
              <View style={{ paddingTop: 16 }}>
                <Text>
                  Amount to repay: USh {numeral(amountToRepay).format('0,0')}
                </Text>
              </View>
            </View>
          )}
        </View>
        <Divider />
        <View style={{ padding: 16 }}>
          <ATitle>Basic information</ATitle>
          <MFormText
            label="Occupation"
            name="content.occupation"
            control={control}
            errors={errors}
            readOnly={readOnly}
          />
          <MFormText
            label="Date of birth"
            name="content.dateOfBirth"
            control={control}
            errors={errors}
            rules={{
              pattern: {
                value: /[0-9]{2}\/[0-9]{2}\/[0-9]{4}/,
                message: dateFormat,
              },
              validate: value =>
                moment(value, 'DD/MM/YYYY').isValid() || dateInvalid,
              required: { value: true, message: required },
            }}
            helperText="DD/MM/YYYY"
            readOnly={readOnly}
          />
          <MFormRadioGroup
            label="Sex"
            name="content.sex"
            items={[
              { value: 'female', label: 'Female' },
              { value: 'male', label: 'Male' },
            ]}
            control={control}
            errors={errors}
            readOnly={readOnly}
          />
          <MFormText
            label="Name of father or husband"
            name="content.fatherOrHusbandName"
            control={control}
            errors={errors}
            readOnly={readOnly}
          />
          <MFormText
            label="Mobile phone number"
            name="content.mobilePhoneNumber"
            control={control}
            errors={errors}
            rules={{}} // Optional
            readOnly={readOnly}
          />
          <MFormText
            label="National ID or Voter ID number"
            name="content.nationalVoterIdNumber"
            control={control}
            errors={errors}
            readOnly={readOnly}
          />
          <MFormPhoto
            label="National ID or Voter ID photo"
            context="National ID or Voter ID"
            name="content.nationalVoterIdPhoto"
            control={control}
            errors={errors}
            screen={screen}
            navigation={navigation}
            taken="Review"
            readOnly={readOnly}
          />
          <MFormPhoto
            label="Photo of the client"
            context="Client"
            name="content.photo"
            control={control}
            errors={errors}
            screen={screen}
            navigation={navigation}
            taken="Review"
            readOnly={readOnly}
          />
          {requiredDocuments &&
            requiredDocuments.map((document, index) => (
              <MFormPhoto
                key={document._id}
                label={document.name}
                name={`content.loanRequirements[${index}]`}
                control={control}
                errors={errors}
                screen={screen}
                navigation={navigation}
                taken="Review"
                readOnly={readOnly}
              />
            ))}
        </View>
        <Divider />
        <View style={{ padding: 16 }}>
          <ATitle>Residence</ATitle>
          <MFormText
            label="Village/Area"
            name="content.residence.area"
            control={control}
            errors={errors}
            readOnly={readOnly}
          />
          <MFormText
            label="Sub–county"
            name="content.residence.subcounty"
            control={control}
            errors={errors}
            readOnly={readOnly}
          />
          <MFormText
            label="County"
            name="content.residence.county"
            control={control}
            errors={errors}
            readOnly={readOnly}
          />
          <MFormText
            label="District/Division"
            name="content.residence.district"
            control={control}
            errors={errors}
            readOnly={readOnly}
          />
          <MFormText
            label="Notes"
            name="content.residence.notes"
            control={control}
            errors={errors}
            rules={{}} // Optional
            readOnly={readOnly}
          />
        </View>
        <Divider />
        <View style={{ padding: 16 }}>
          <ATitle>Work</ATitle>
          <MFormText
            label="Village/Area"
            name="content.work.area"
            control={control}
            errors={errors}
            readOnly={readOnly}
          />
          <MFormText
            label="Sub–county"
            name="content.work.subcounty"
            control={control}
            errors={errors}
            readOnly={readOnly}
          />
          <MFormText
            label="County"
            name="content.work.county"
            control={control}
            errors={errors}
            readOnly={readOnly}
          />
          <MFormText
            label="District/Division"
            name="content.work.district"
            control={control}
            errors={errors}
            readOnly={readOnly}
          />
          <MFormText
            label="Notes"
            name="content.work.notes"
            control={control}
            errors={errors}
            rules={{}} // Optional
            readOnly={readOnly}
          />
        </View>
        <Divider />
        <View style={{ padding: 16 }}>
          <ATitle>Previous loan</ATitle>
          <MFormCurrency
            label="Amount"
            name="content.previousLoan.amount"
            control={control}
            errors={errors}
            rules={{ valueAsNumber: true }} // Optional
            readOnly={readOnly}
          />
          <MFormText
            label="Cycle"
            name="content.previousLoan.cycle"
            control={control}
            errors={errors}
            rules={{}} // Optional
            keyboardType="numeric"
            readOnly={readOnly}
          />
          <MFormText
            label="Purpose"
            name="content.previousLoan.purpose"
            control={control}
            errors={errors}
            rules={{}} // Optional
            readOnly={readOnly}
          />
        </View>
        <Divider />
        <View style={{ padding: 16 }}>
          <ATitle>Projects</ATitle>
          <MFormText
            label="#1"
            name="content.projects[0]"
            control={control}
            errors={errors}
            readOnly={readOnly}
          />
          <MFormText
            label="#2"
            name="content.projects[1]"
            control={control}
            errors={errors}
            readOnly={readOnly}
          />
        </View>
        <Divider />
        <View style={{ padding: 16, paddingBottom: 4 }}>
          <ATitle>Guarantors</ATitle>
          {requiredGuarantors &&
            requiredGuarantors.map((type, index) => (
              <MFormGuarantor
                key={Number(index) + 1}
                number={Number(index) + 1}
                type={type}
                control={control}
                errors={errors}
                screen={screen}
                navigation={navigation}
                taken="Review"
                signed="Review"
                readOnly={readOnly}
              />
            ))}
        </View>
        <Divider />
        <View style={{ padding: 16, paddingBottom: 16 }}>
          <ATitle>Inspection</ATitle>
          <MFormPhoto
            label="Home"
            context="Inspection photo: Home"
            name="content.inspection[0]"
            control={control}
            errors={errors}
            screen={screen}
            taken={readOnly ? 'Review' : undefined}
            navigation={navigation}
            readOnly={readOnly}
          />
          <MFormPhoto
            label="Work"
            context="Inspection photo: Work"
            name="content.inspection[1]"
            control={control}
            errors={errors}
            screen={screen}
            taken={readOnly ? 'Review' : undefined}
            navigation={navigation}
            readOnly={readOnly}
          />
          <MFormText
            label="Optional notes"
            name="notes"
            control={control}
            errors={errors}
            rules={{}} // Optional
            readOnly={readOnly}
          />
        </View>
        <Divider />
        <View style={{ padding: 16, paddingBottom: 16 }}>
          <ATitle>Consent</ATitle>
          <MFormRadioGroup
            label="Declaration"
            helperText="This declaration will also be applicable to my heirs or successors in title or other persons concerned. Until I fully repay the entire loan amount, interest and service charges levied, Umoja reserves the right to take possession of the assets/security made by this loan. All assets/security thus acquired will not be transferable until the said loan amount is fully paid. I will abide by all the terms and conditions set out in the loan agreement. Failure to repay the entire loan amount Umoja shall take the appropriate legal action against me. I hereby give the consent to share my personal information with relevant parties, including law enforcement agencies, credit reference bureaus and similar institutions, networking institutions, etc."
            helperTextLong
            name="consent"
            items={[
              { value: 1, label: 'I consent' },
              { value: 0, label: 'I do not consent' },
            ]}
            control={control}
            errors={errors}
            readOnly={true}
            defaultValue={1}
          />
        </View>
        <Divider />
        <View style={{ padding: 16, paddingBottom: 16 }}>
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
            readOnly={readOnly}
          />
          <MFormSignature
            label="Branch Manager"
            name="signatures.employee"
            control={control}
            errors={errors}
            screen={screen}
            navigation={navigation}
            readOnly={readOnly}
          />
        </View>
        {!readOnly && (
          <View>
            <Divider />
            <View style={{ padding: 16 }}>
              {isProcessing && (
                <View style={{ padding: 61, paddingBottom: 62 }}>
                  <AActivityIndicator />
                </View>
              )}
              {!isProcessing && (
                <View>
                  <AButton
                    mode="contained"
                    onPress={handleSubmit(approve, onError)}
                  >
                    Approve loan
                  </AButton>
                  <View style={{ paddingTop: 16 }}>
                    <AButton
                      onPress={handleSubmit(reject, onError)}
                      color={Colors.red}
                    >
                      Reject loan
                    </AButton>
                  </View>
                  <View style={{ paddingTop: 16 }}>
                    <AButton onPress={() => onSaveDraft()}>Save draft</AButton>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
      <Portal>
        <ASnackbar
          visible={snackbar}
          duration={1000}
          onDismiss={() => {
            setSnackbar(false)
            setSnackbarText(null)
          }}
        >
          {snackbarText}
        </ASnackbar>
      </Portal>
      <MDraftErrorDialog
        visible={draftErrorDialog}
        onDismiss={() => setDraftErrorDialog(false)}
      />
      <MGeneralErrorDialog
        visible={generalErrorDialog}
        onDismiss={() => setGeneralErrorDialog(false)}
      />
      <MLocationErrorDialog
        visible={locationErrorDialog}
        onDismiss={() => setLocationErrorDialog(false)}
      />
    </ASafeAreaView>
  )
}

export default FormClientInspectionScreen
