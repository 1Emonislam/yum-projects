import { Link, useParams } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import {
  dateInvalid,
  durationUnitToFrequency,
  required,
  timeFormat,
  timezone,
  useAuth,
  useSecureLoanById,
  useUpdateLoan,
} from 'shared'
import { useForm } from 'react-hook-form'
import { useHistory } from 'react-router-dom'
import { useQueryClient } from 'react-query'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import camelCase from 'lodash/camelCase'
import CircularProgress from '@material-ui/core/CircularProgress'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Grid from '@material-ui/core/Grid'
import InputAdornment from '@material-ui/core/InputAdornment'
import MFormTextField from '../molecules/MFormTextField'
import MFormSelect from '../molecules/MFormSelect'
import MGeneralErrorDialog from '../molecules/MGeneralErrorDialog'
import moment from 'moment-timezone'
import numeral from 'numeral'
import React, { Fragment, useEffect, useMemo, useState } from 'react'
import TClient from '../templates/TClient'
import Typography from '@material-ui/core/Typography'

const useStyles = makeStyles(theme => ({
  action: {
    paddingLeft: 16,
    paddingRight: 16,
    borderRadius: '36px',
  },
  bar: {
    borderBottom: '1px solid',
    borderBottomColor: theme.palette.grey[300],
  },
  button: {
    background: 'none',
    border: 0,
    padding: 0,
    margin: 0,
    fontSize: 'inherit',
    letterSpacing: 'inherit',
    color: 'inherit',
    cursor: 'pointer',
    textDecoration: 'underline',
    '&:focus': {
      outline: 'none',
    },
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  formControl: {
    width: '100%',
  },
}))

const PClientLoanEdit = () => {
  const classes = useStyles()

  const space = 4

  const { clientId, loanId } = useParams()

  const { _id: userId, branchId, role } = useAuth()

  const { isFetching, data: loan } = useSecureLoanById({
    id: loanId,
    role,
    userId,
    branchId,
  })

  const history = useHistory()

  const queryClient = useQueryClient()

  const { mutate } = useUpdateLoan()

  const [changes, setChanges] = useState([])
  const [cashAtHand, setCashAtHand] = useState()
  const [dialog, setDialog] = useState(false)
  const [generalErrorDialog, setGeneralErrorDialog] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const { control, handleSubmit, errors, setValue, watch } = useForm()

  const handleChanges = data => {
    let detectedChanges = []

    const disbursementInitial = loan.disbursementAt
      ? moment(loan.disbursementAt).tz(timezone).format(timeFormat.input)
      : ''

    if (String(disbursementInitial) !== String(data.disbursement).trim()) {
      detectedChanges.push({
        name: 'Disbursement',
        before: disbursementInitial,
        after: data.disbursement,
      })
    }

    const firstInstallmentCollectionInitial = loan.disbursementAt
      ? moment(loan.installments[0].due).tz(timezone).format(timeFormat.input)
      : ''

    if (
      String(firstInstallmentCollectionInitial) !==
      String(data.firstInstallmentCollection).trim()
    ) {
      detectedChanges.push({
        name: 'First installment collection',
        before: firstInstallmentCollectionInitial,
        after: data.firstInstallmentCollection,
      })
    }

    if (
      String(loan.approvedAmount || loan.requestedAmount) !==
      String(data.principal)
    ) {
      detectedChanges.push({
        name: 'Principal',
        before: loan.approvedAmount || loan.requestedAmount,
        after: data.principal,
      })
    }

    if (String(loan.installments[0].target) !== String(data.installment)) {
      detectedChanges.push({
        name: 'Installment',
        before: loan.installments[0].target,
        after: data.installment,
      })
    }

    if (String(outstanding) !== String(data.outstanding)) {
      detectedChanges.push({
        name: 'Outstanding',
        before: outstanding,
        after: data.outstanding,
      })
    }

    if (String(loan.cycle) !== String(data.cycle)) {
      detectedChanges.push({
        name: 'Cycle',
        before: loan.cycle,
        after: data.cycle,
      })
    }

    if (String(loan.duration.value) !== String(data.duration)) {
      detectedChanges.push({
        name: 'Duration',
        before: loan.duration.value,
        after: data.duration,
      })
    }

    setChanges(detectedChanges)

    if (detectedChanges.length > 0) {
      let openCashAtHand = false

      for (let i = 0; i < detectedChanges.length; i++) {
        const change = detectedChanges[i]

        if (change) {
          if (change.name !== 'Cycle') {
            openCashAtHand = true
            break
          } else {
            if (String(change.before) === '1' || String(change.after) === '1') {
              openCashAtHand = true
              break
            }
          }
        }
      }

      if (openCashAtHand) {
        let cashAtHandReopenStartDate = moment(loan.branch.initDate)

        if (
          moment(data.firstInstallmentCollection, timeFormat.input).isAfter(
            loan.branch.initDate,
            'day'
          ) &&
          moment(data.firstInstallmentCollection, timeFormat.input).isBefore(
            moment(),
            'day'
          )
        ) {
          cashAtHandReopenStartDate = moment(
            data.firstInstallmentCollection,
            timeFormat.input
          )
        }

        if (
          moment(loan.firstInstallmentCollection).isAfter(
            loan.branch.initDate,
            'day'
          ) &&
          moment(loan.firstInstallmentCollection).isBefore(
            moment(data.firstInstallmentCollection, timeFormat.input),
            'day'
          )
        ) {
          cashAtHandReopenStartDate = moment(loan.firstInstallmentCollection)
        }

        setCashAtHand(cashAtHandReopenStartDate.tz(timezone).startOf('day'))
      }
    }
  }

  const onErrors = () => {
    console.log('onErrors')
  }

  const onSubmit = data => {
    handleChanges(data)

    setDialog(true)
  }

  const formatToDisplay = (value, context) => {
    if (['Principal', 'Installment', 'Outstanding'].includes(context)) {
      return numeral(value).format('0,0')
    }

    return value
  }

  const formatToSave = (value, context) => {
    if (['Disbursement', 'First installment collection'].includes(context)) {
      return moment(value, timeFormat.input).tz(timezone).format()
    }

    return Number(value)
  }

  const save = () => {
    setIsProcessing(true)

    let props = {}

    props['_id'] = loan._id

    changes.forEach(change => {
      const key = camelCase(change.name)

      props[key] = formatToSave(change.after, change.name)
    })

    if (cashAtHand) {
      props['cashAtHand'] = moment(cashAtHand).tz(timezone).format()
    }

    props['meta'] = JSON.stringify(changes)

    mutate(props, {
      onError: () => {
        setIsProcessing(false)
        setGeneralErrorDialog(true)
      },
      onSuccess: () => {
        setIsProcessing(false)

        queryClient.invalidateQueries('loanById')

        if (cashAtHand) {
          history.push(
            `/reports/cash-at-hand/?date=${moment(cashAtHand)
              .tz(timezone)
              .format(timeFormat.default)}&branchId=${loan.branch._id}`,
            {
              snackbar: `Changes in the loan ${loan?.code} has been saved`,
            }
          )
        } else {
          history.push(`/clients/${clientId}/loans/${loanId}`, {
            snackbar: `Changes in the loan ${loan?.code} has been saved`,
          })
        }
      },
    })
  }

  const outstanding = useMemo(() => {
    if (loan && loan.status === 'active') {
      const cumulativeRealization = loan.installments.reduce(
        (acc, installment = {}) => {
          const { realization = 0, total, target } = installment
          return acc + realization + (total - target)
        },
        0
      )

      const disbursedAmount =
        loan.approvedAmount + loan.approvedAmount * (loan.interestRate / 100)

      return Math.floor(disbursedAmount - cumulativeRealization)
    }

    return '0'
  }, [loan])

  useEffect(() => {
    if (loan) {
      if (loan.disbursementAt) {
        setValue(
          'disbursement',
          moment(loan.disbursementAt).tz(timezone).format(timeFormat.input)
        )

        setValue(
          'firstInstallmentCollection',
          moment(loan.installments[0].due).tz(timezone).format(timeFormat.input)
        )
      }

      setValue('principal', loan.approvedAmount || loan.requestedAmount)

      setValue('installment', loan.installments[0].target)

      setValue('outstanding', outstanding)

      setValue('cycle', loan.cycle)

      setValue('duration', loan.duration.value)
    }
  }, [loan, loanId, isFetching, setValue, outstanding])

  const principalValue = watch('principal')
  const installmentValue = watch('installment')
  const outstandingValue = watch('outstanding')

  const durations = useMemo(() => {
    if (loan) {
      const frequency = durationUnitToFrequency(loan.duration.unit)

      return loan.loanProduct.durations[frequency].map(duration => {
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
    }

    return []
  }, [loan])

  return (
    <TClient active="loans" clientId={clientId}>
      <form
        onSubmit={handleSubmit(onSubmit, onErrors)}
        className={classes.form}
      >
        <Box
          display="flex"
          alignItems="center"
          pl={2}
          pr={1}
          className={classes.bar}
          height={53}
          flexShrink={0}
        >
          <Typography variant="h2">
            {isFetching ? 'Loading…' : `Loan ${loan?.code}`}
          </Typography>
          <Box flexGrow={1} />
          {!isFetching && !isProcessing && (
            <Box p={1}>
              <Grid container spacing={1}>
                <Grid item>
                  <Button
                    component={Link}
                    to={`/clients/${clientId}/loans/${loanId}`}
                  >
                    Cancel
                  </Button>
                </Grid>
                <Grid item>
                  <Button variant="contained" color="primary" type="submit">
                    Save
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}
          {isProcessing && (
            <Box pr={3}>
              <CircularProgress color="secondary" size={24} />
            </Box>
          )}
        </Box>
        <Box
          flexGrow={1}
          width="100%"
          overflow="auto"
          display="flex"
          justifyContent="center"
          pl={2}
          pr={1}
          pt={2}
          pb={8}
        >
          {isFetching && (
            <Box
              display="flex"
              flexGrow={1}
              justifyContent="center"
              alignItems="center"
            >
              <CircularProgress color="secondary" />
            </Box>
          )}
          {!isFetching && (
            <Box display="flex" justifyContent="center">
              <Box width={460}>
                <Box pt={space}>
                  <Box pb={3}>
                    <Typography variant="h2">Dates</Typography>
                  </Box>
                  <MFormTextField
                    label="Disbursement"
                    name="disbursement"
                    helperText={timeFormat.input}
                    control={control}
                    errors={errors}
                    additionalSpace
                    rules={{
                      validate: value => {
                        if (!moment(value, timeFormat.input).isValid()) {
                          return dateInvalid
                        }

                        const match = value.match(
                          /[0-9]{1,2}\/[0-9]{2}\/[0-9]{4}/
                        )

                        if (
                          !match ||
                          match?.[0] !== String(match?.input).trim()
                        ) {
                          return `Please enter the date in ${timeFormat.input} format`
                        }

                        return true
                      },
                      required: { value: true, message: required },
                    }}
                  />
                  <MFormTextField
                    label="First installment collection"
                    name="firstInstallmentCollection"
                    helperText={timeFormat.input}
                    control={control}
                    errors={errors}
                    rules={{
                      validate: value => {
                        if (!moment(value, timeFormat.input).isValid()) {
                          return dateInvalid
                        }

                        const match = value.match(
                          /[0-9]{1,2}\/[0-9]{2}\/[0-9]{4}/
                        )

                        if (
                          !match ||
                          match?.[0] !== String(match?.input).trim()
                        ) {
                          return `Please enter the date in ${timeFormat.input} format`
                        }

                        if (
                          Number(
                            moment(value, timeFormat.input).isoWeekday()
                          ) !==
                          Number(loan.client.clientGroup.meeting.dayOfWeek)
                        ) {
                          return `Please enter a date, which falls on a ${moment(
                            loan.clientGroup.meeting.dayOfWeek
                          ).format('dddd')}, the client group meeting day`
                        }

                        return true
                      },
                      required: { value: true, message: required },
                    }}
                  />
                </Box>
                <Box pt={space}>
                  <Box pb={3}>
                    <Typography variant="h2">Amounts</Typography>
                  </Box>
                  <MFormTextField
                    label="Principal"
                    name="principal"
                    control={control}
                    errors={errors}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">USh</InputAdornment>
                      ),
                    }}
                    helperText={`USh ${numeral(principalValue).format('0,0')}`}
                    additionalSpace
                    rules={{
                      required: { value: true, message: required },
                      valueAsNumber: true,
                    }}
                  />
                  <MFormTextField
                    label="Installment"
                    name="installment"
                    control={control}
                    errors={errors}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">USh</InputAdornment>
                      ),
                    }}
                    helperText={`USh ${numeral(installmentValue).format(
                      '0,0'
                    )}`}
                    rules={{
                      required: { value: true, message: required },
                      valueAsNumber: true,
                    }}
                    additionalSpace
                  />
                  <MFormTextField
                    label="Outstanding"
                    name="outstanding"
                    control={control}
                    errors={errors}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">USh</InputAdornment>
                      ),
                    }}
                    helperText={`USh ${numeral(outstandingValue).format(
                      '0,0'
                    )}`}
                    rules={{
                      required: { value: true, message: required },
                      valueAsNumber: true,
                    }}
                  />
                </Box>
                <Box pt={space} pb={8}>
                  <Box pb={3}>
                    <Typography variant="h2">Others</Typography>
                  </Box>
                  <MFormTextField
                    label="Cycle"
                    name="cycle"
                    control={control}
                    errors={errors}
                    rules={{
                      validate: value => {
                        if (isNaN(value)) {
                          return 'Please enter a number'
                        }

                        if (Number(value) < 1) {
                          return 'Please enter a number bigger than zero'
                        }

                        return true
                      },
                      required: { value: true, message: required },
                      valueAsNumber: true,
                    }}
                  />
                  <MFormSelect
                    label="Duration"
                    name="duration"
                    control={control}
                    errors={errors}
                    options={durations}
                    defaultValue=""
                  />
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </form>
      <Dialog open={dialog} onClose={() => setDialog(false)}>
        {changes.length > 0 && <DialogTitle>Loan modification</DialogTitle>}
        <DialogContent>
          {changes.length === 0 && (
            <DialogContentText>You haven’t changed anything.</DialogContentText>
          )}
          {changes.length > 0 && (
            <Fragment>
              <DialogContentText>Your changes:</DialogContentText>
              {changes.map((change, index) => {
                let startAdornment = ''
                let endAdornment = ''

                if (
                  ['Principal', 'Installment', 'Outstanding'].includes(
                    change.name
                  )
                ) {
                  startAdornment = 'USh '
                }

                if (change.name === 'Duration') {
                  endAdornment = ' weeks'
                }

                return (
                  <DialogContentText key={index}>
                    · {change.name}:{' '}
                    <strong>
                      {startAdornment}
                      {formatToDisplay(change.after, change.name)}
                      {endAdornment}
                    </strong>{' '}
                    <del>
                      {startAdornment}
                      {formatToDisplay(change.before, change.name)}
                      {endAdornment}
                    </del>
                  </DialogContentText>
                )
              })}
              {cashAtHand && (
                <DialogContentText style={{ paddingTop: 16, color: '#f44336' }}>
                  {changes.length > 1 ? 'These' : 'This'} change
                  {changes.length > 1 ? 's' : ''} will open cash at hand reports
                  in the {loan.branch.name} branch
                  <br />
                  from {moment(cashAtHand).format(timeFormat.input)} to today.
                </DialogContentText>
              )}
            </Fragment>
          )}
        </DialogContent>
        <DialogActions>
          {changes.length > 0 && (
            <Fragment>
              {!isProcessing && (
                <Fragment>
                  <Button color="primary" onClick={() => setDialog(false)}>
                    Cancel
                  </Button>
                  <Button color="primary" onClick={() => save()}>
                    Save changes
                  </Button>
                </Fragment>
              )}
              {isProcessing && (
                <Box pr={2} style={{ paddingBottom: '7px' }}>
                  <CircularProgress color="secondary" size={24} />
                </Box>
              )}
            </Fragment>
          )}
          {changes.length === 0 && (
            <Button color="primary" onClick={() => setDialog(false)}>
              OK
            </Button>
          )}
        </DialogActions>
      </Dialog>
      <MGeneralErrorDialog
        visible={generalErrorDialog}
        onDismiss={() => setGeneralErrorDialog(false)}
      />
    </TClient>
  )
}

export default PClientLoanEdit
