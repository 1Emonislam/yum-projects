import { makeStyles } from '@material-ui/core/styles'
import {
  required,
  timeFormat,
  timezone,
  useCollectInstallmentsAsNonLoanOfficer,
} from 'shared'
import { useForm } from 'react-hook-form'
import { useQueryClient } from 'react-query'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import InputAdornment from '@material-ui/core/InputAdornment'
import MFormRadioGroup from '../molecules/MFormRadioGroup'
import MFormSelect from '../molecules/MFormSelect'
import MFormTextField from '../molecules/MFormTextField'
import MGeneralErrorDialog from '../molecules/MGeneralErrorDialog'
import moment from 'moment-timezone'
import numeral from 'numeral'
import React, { Fragment, useMemo, useState } from 'react'
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
  th: {
    fontSize: '13px',
    lineHeight: 1.5,
  },
  caption: {
    color: theme.palette.grey[500],
    fontSize: '0.9rem',
  },
  realization: {
    '& input, & + p': { textAlign: 'right' },
  },
  installment: {
    paddingBottom: '11px',
  },
}))

const OCollectInstallmentsDialog = ({ loan, onClose, open }) => {
  const classes = useStyles()

  const queryClient = useQueryClient()

  const { mutate: collectInstallmentsAsNonLoanOfficer } =
    useCollectInstallmentsAsNonLoanOfficer()

  const [isProcessing, setIsProcessing] = useState(false)
  const [generalErrorDialog, setGeneralErrorDialog] = useState(false)

  const { control, handleSubmit, errors, watch } = useForm()

  const modeValue = watch('mode')
  const installmentValue = watch('installment')
  const realizationValue = watch('realization')
  const sourceValue = watch('source')

  const onSubmit = data => {
    setIsProcessing(true)

    const {
      realization,
      installment,
      source = 'cash',
      mode,
      argumentation,
      cashCollectionDay,
    } = data

    collectInstallmentsAsNonLoanOfficer(
      {
        loanId: String(loan._id),
        installmentId: installment,
        realization,
        source,
        mode,
        argumentation,
        cashCollectionDay,
      },
      {
        onError: () => {
          console.log('Mutation #1: onError')

          setIsProcessing(false)
          onClose()
          setGeneralErrorDialog(true)
        },
        onSuccess: async () => {
          console.log('Mutation #1: onSuccess')

          setIsProcessing(false)

          queryClient.invalidateQueries('clientById')
          queryClient.invalidateQueries('loanById')
          queryClient.invalidateQueries('loansByClientId')
          queryClient.invalidateQueries('useAmortization')

          onClose()
        },
      }
    )
  }

  const cumulativeRealizationSoFar = useMemo(() => {
    if (loan) {
      return loan.installments.reduce((acc, installment = {}) => {
        const { realization = 0, total, target } = installment
        return acc + realization + (total - target)
      }, 0)
    }

    return 0
  }, [loan])

  const overdueInstallments = useMemo(() => {
    if (loan) {
      return loan.installments.filter(
        installment => installment.status === 'late'
      )
    }

    return []
  }, [loan])

  const overdueSums = useMemo(() => {
    return overdueInstallments.reduce(
      (acc, installment) => {
        return {
          target: acc.target + installment.target,
          realization: acc.realization + installment.realization,
        }
      },
      {
        target: 0,
        realization: 0,
      }
    )
  }, [overdueInstallments])

  const overdue = useMemo(() => {
    return overdueSums.target - overdueSums.realization
  }, [overdueSums])

  const disbursedAmount = useMemo(() => {
    if (loan) {
      return loan.installments.reduce(
        (acc, installment) => acc + installment.total,
        0
      )
    }

    return 0
  }, [loan])

  const openingBalance = useMemo(() => {
    return disbursedAmount - cumulativeRealizationSoFar
  }, [disbursedAmount, cumulativeRealizationSoFar])

  const inAdvance = useMemo(() => {
    return openingBalance - overdue
  }, [openingBalance, overdue])

  const closingSecurityBalance = useMemo(() => {
    const securityBalance = loan?.client?.securityBalance || 0

    const currentRealization = isNaN(realizationValue) ? 0 : realizationValue

    if (securityBalance - currentRealization < 0) {
      return 0
    }

    return securityBalance - currentRealization
  }, [loan, realizationValue])

  const requiredSupplementaryPaymentInCash = useMemo(() => {
    if (closingSecurityBalance === 0) {
      const securityBalance = loan?.client?.securityBalance || 0

      const currentRealization = isNaN(realizationValue) ? 0 : realizationValue

      return currentRealization - securityBalance
    }

    return 0
  }, [loan, closingSecurityBalance, realizationValue])

  const cumulativeRealization = useMemo(() => {
    const currentRealization = isNaN(realizationValue) ? 0 : realizationValue

    return cumulativeRealizationSoFar + currentRealization
  }, [cumulativeRealizationSoFar, realizationValue])

  const outstandingBalance = useMemo(() => {
    return disbursedAmount - cumulativeRealization
  }, [disbursedAmount, cumulativeRealization])

  const installments = useMemo(() => {
    if (!loan) {
      return []
    }

    const installmentsWithNumbers = loan.installments.map(
      (installment, index) => {
        return {
          number: index + 1,
          ...installment,
        }
      }
    )

    const installmentsThatCanBeCollected = installmentsWithNumbers.filter(
      installment => installment.target !== installment.realization
    )

    const installmentsPreparedToBeUsedInSelect =
      installmentsThatCanBeCollected.map(installment => {
        const number = installment.number

        const date = moment(installment.due)
          .tz(timezone)
          .format(timeFormat.default)

        const amount = installment.target - installment.realization

        const amountLabel = `USh ${numeral(amount).format('0,0')} to pay`

        return {
          value: String(installment._id),
          label: `${number}. ${date} ${amountLabel}`,
          amount,
        }
      })

    return installmentsPreparedToBeUsedInSelect
  }, [loan])

  const isAdvancePaymentPossible = useMemo(() => {
    if (!loan) {
      return false
    }

    return loan.installments.some(
      installment =>
        installment.status !== 'paid' &&
        moment(installment.due)
          .tz(timezone)
          .isAfter(moment().tz(timezone), 'day')
    )
  }, [loan])

  const SecurityBalance = ({
    visible,
    opening,
    closing,
    requiredSupplementaryPaymentInCash,
  }) => (
    <Fragment>
      {visible && (
        <Fragment>
          <Box display="flex" justifyContent="space-between" pb={2}>
            <Box pr={4}>
              <Typography variant="body1">Opening security balance:</Typography>
            </Box>
            <Typography variant="body1">
              USh {numeral(opening || 0).format('0,0')}
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" pb={2}>
            <Box pr={4}>
              <Typography variant="body1">Closing security balance:</Typography>
            </Box>
            <Typography variant="body1">
              USh {numeral(closing).format('0,0')}
            </Typography>
          </Box>
          {/* <Box display="flex" justifyContent="space-between" pb={2}>
            <Box pr={4}>
              <Typography
                variant="body1"
                style={
                  requiredSupplementaryPaymentInCash > 0
                    ? { fontWeight: '500' }
                    : {}
                }
              >
                Required supplementary payment in cash:
              </Typography>
            </Box>
            <Typography
              variant="body1"
              style={
                requiredSupplementaryPaymentInCash > 0
                  ? { fontWeight: '500' }
                  : {}
              }
            >
              USh {numeral(requiredSupplementaryPaymentInCash).format('0,0')}
            </Typography>
          </Box> */}
        </Fragment>
      )}
    </Fragment>
  )

  return (
    <Fragment>
      <Dialog
        open={open}
        onClose={onClose}
        scroll="body"
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>
            <Box>Collect installments</Box>
          </DialogTitle>
          <DialogContent dividers style={{ paddingBottom: 0 }}>
            {isAdvancePaymentPossible && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mr={-2}
                pb={1}
              >
                <Typography variant="body1">Mode:</Typography>
                <Box display="flex">
                  <MFormRadioGroup
                    name="mode"
                    defaultValue="repayment"
                    control={control}
                    errors={errors}
                    options={[
                      { value: 'repayment', label: 'Repayment' },
                      { value: 'overpayment', label: 'Advance Payment' },
                    ]}
                  />
                </Box>
              </Box>
            )}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              height={
                modeValue === undefined || modeValue === 'repayment'
                  ? 'auto'
                  : '0px'
              }
              visibility={
                modeValue === undefined || modeValue === 'repayment'
                  ? 'visible'
                  : 'hidden'
              }
            >
              <Box className={classes.installment}>
                <Typography variant="body1">Installment:</Typography>
              </Box>
              <Box display="flex" width="75%">
                <MFormSelect
                  name="installment"
                  control={control}
                  errors={errors}
                  options={installments}
                  defaultValue={installments[0]?.value}
                />
              </Box>
            </Box>
            <Box display="flex" justifyContent="space-between" pb={2}>
              <Box>
                <Typography variant="body1">Overdue:</Typography>
                <Typography variant="body1" className={classes.caption}>
                  Amount that was late to pay
                </Typography>
              </Box>
              <Typography variant="body1">
                USh {numeral(overdue).format('0,0')}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" pb={2}>
              <Box>
                <Typography variant="body1">Missed installments:</Typography>
                <Typography variant="body1" className={classes.caption}>
                  Number of installments that were not fully paid
                </Typography>
              </Box>
              <Typography variant="body1">
                {overdueInstallments.length}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" pb={2}>
              <Box pr={4}>
                <Typography variant="body1">Opening balance:</Typography>
                <Typography variant="body1" className={classes.caption}>
                  Amount still owed before this payment
                </Typography>
              </Box>
              <Typography variant="body1">
                USh {numeral(openingBalance).format('0,0')}
              </Typography>
            </Box>
            <Box
              display="flex"
              justifyContent="space-between"
              pb={modeValue === 'overpayment' ? 2 : 0}
              height={modeValue === 'overpayment' ? 'auto' : '0px'}
              visibility={modeValue === 'overpayment' ? 'visible' : 'hidden'}
            >
              <Box pr={4}>
                <Typography variant="body1">
                  How much you can collect in advance:
                </Typography>
                <Typography variant="body1" className={classes.caption}>
                  Not including overdue
                </Typography>
              </Box>
              <Typography variant="body1">
                USh {numeral(inAdvance).format('0,0')}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Box pt={2} pr={2}>
                <Typography variant="body1">Realization:</Typography>
              </Box>
              <MFormTextField
                name="realization"
                control={control}
                errors={errors}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">USh</InputAdornment>
                  ),
                  className: classes.realization,
                }}
                helperText={`USh ${numeral(realizationValue).format('0,0')}`}
                defaultValue=""
                autoFocus
                rules={{
                  required: { value: true, message: required },
                  validate: value => {
                    if (isNaN(value)) {
                      return String(value).includes(',')
                        ? 'Please enter a number without commas'
                        : String(value).includes('-')
                        ? 'Please enter a number greater than zero'
                        : 'Please enter a number'
                    }

                    if (String(value).includes('.')) {
                      return 'Please enter a number without dots'
                    }

                    if (Number(value) > openingBalance) {
                      return 'Please enter a number no greater than the opening balance'
                    }

                    if (Number(value) < 1) {
                      return 'Please enter a number greater than zero'
                    }

                    if (modeValue === undefined || modeValue === 'repayment') {
                      const installment = installments.find(
                        installment => installment.value === installmentValue
                      )

                      if (installment) {
                        if (Number(value) > Number(installment.amount)) {
                          return 'Please enter a number no greater than the installment amount'
                        }
                      }
                    } else {
                      if (Number(value) > Number(inAdvance)) {
                        return 'Please enter a number no greater than the limit above'
                      }
                    }

                    return true
                  },
                  valueAsNumber: true,
                }}
              />
            </Box>
            {(loan?.client?.securityBalance || 0) >= openingBalance &&
              (loan?.client?.securityBalance || 0) > 0 && (
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mr={-2}
                  pb={3}
                >
                  <Typography variant="body1">Source:</Typography>
                  <Box display="flex">
                    <MFormRadioGroup
                      name="source"
                      defaultValue="cash"
                      control={control}
                      errors={errors}
                      options={[
                        { value: 'cash', label: 'Cash' },
                        { value: 'security', label: 'Security' },
                      ]}
                    />
                  </Box>
                </Box>
              )}
            <SecurityBalance
              visible={sourceValue === 'security'}
              opening={loan?.client?.securityBalance}
              closing={closingSecurityBalance}
              requiredSupplementaryPaymentInCash={
                requiredSupplementaryPaymentInCash
              }
            />
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mr={-2}
              mt={
                (modeValue === undefined || modeValue === 'repayment') &&
                sourceValue !== 'security'
                  ? -1
                  : 0
              }
              pb={
                (modeValue === undefined || modeValue === 'repayment') &&
                sourceValue !== 'security'
                  ? 3
                  : 0
              }
              height={
                (modeValue === undefined || modeValue === 'repayment') &&
                sourceValue !== 'security'
                  ? 'auto'
                  : '0px'
              }
              visibility={
                (modeValue === undefined || modeValue === 'repayment') &&
                sourceValue !== 'security'
                  ? 'visible'
                  : 'hidden'
              }
            >
              <Typography variant="body1">Cash collection day:</Typography>
              <Box display="flex">
                <MFormRadioGroup
                  name="cashCollectionDay"
                  defaultValue="today"
                  control={control}
                  errors={errors}
                  options={[
                    { value: 'today', label: 'Today' },
                    {
                      value: 'installmentDays',
                      label:
                        modeValue === undefined || modeValue === 'repayment'
                          ? 'On the installment day'
                          : 'On the installment days',
                    },
                  ]}
                />
              </Box>
            </Box>
            <Box display="flex" justifyContent="space-between" pb={2}>
              <Box pr={4}>
                <Typography variant="body1">Cumulative realization:</Typography>
                <Typography variant="body1" className={classes.caption}>
                  Sum of all payments (including the current one)
                </Typography>
              </Box>
              <Typography variant="body1">
                USh {numeral(cumulativeRealization).format('0,0')}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" pb={2}>
              <Box pr={4}>
                <Typography variant="body1">Outstanding balance:</Typography>
                <Typography variant="body1" className={classes.caption}>
                  Amount still owed after collecting the current payment
                </Typography>
              </Box>
              {Number(realizationValue) <= openingBalance &&
                Number(realizationValue) > 0 && (
                  <Typography variant="body1">
                    USh {numeral(outstandingBalance).format('0,0')}
                  </Typography>
                )}
              {(Number(realizationValue) > openingBalance ||
                isNaN(realizationValue) ||
                Number(realizationValue) < 1) && (
                <Typography variant="body1">—</Typography>
              )}
            </Box>
            <Box>
              <Typography variant="body1">Argumentation:</Typography>
              <Typography variant="body1" className={classes.caption}>
                Why are you collecting installments outside of a group meeting?
              </Typography>
            </Box>
            <MFormTextField
              name="argumentation"
              control={control}
              errors={errors}
              defaultValue=""
              multiline
              rows={4}
            />
          </DialogContent>
          <DialogActions style={{ fontSize: '1rem' }}>
            {!isProcessing && (
              <Fragment>
                <Button color="primary" onClick={onClose}>
                  Cancel
                </Button>
                <Button color="primary" type="submit">
                  Collect
                </Button>
              </Fragment>
            )}
            {isProcessing && (
              <Box pr={2} style={{ paddingTop: '6px' }}>
                <CircularProgress color="secondary" size={24} />
              </Box>
            )}
          </DialogActions>
        </form>
      </Dialog>
      <MGeneralErrorDialog
        visible={generalErrorDialog}
        onDismiss={() => setGeneralErrorDialog(false)}
      />
    </Fragment>
  )
}

export default OCollectInstallmentsDialog
