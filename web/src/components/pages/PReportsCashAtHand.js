import { KeyboardDatePicker } from '@material-ui/pickers'
import { makeStyles } from '@material-ui/core/styles'
import {
  timeFormat,
  timezone,
  useCanCloseCashAtHandReport,
  useCashAtHandForm,
  useExportCashAtHandReport,
  useHolidays,
  useInitCashAtHandReport,
  useInsertEvent,
  useOpenCashAtHandReport,
  useSecureBranches,
  useUserProfile,
} from 'shared'
import { useQueryString } from 'use-route-as-state'
import { Controller, useForm } from 'react-hook-form'
import { get } from 'lodash'
import { useQueryClient } from 'react-query'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import ArrowForwardIcon from '@material-ui/icons/ArrowForward'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import FormControl from '@material-ui/core/FormControl'
import IconButton from '@material-ui/core/IconButton'
import InputBase from '@material-ui/core/InputBase'
import InputLabel from '@material-ui/core/InputLabel'
import LockIcon from '@material-ui/icons/Lock'
import LockOpenIcon from '@material-ui/icons/LockOpen'
import MenuItem from '@material-ui/core/MenuItem'
import moment from 'moment-timezone'
import numeral from 'numeral'
import NoEncryptionOutlinedIcon from '@material-ui/icons/NoEncryptionOutlined'
import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import Select from '@material-ui/core/Select'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableChartIcon from '@material-ui/icons/TableChart'
import TableRow from '@material-ui/core/TableRow'
import TextField from '@material-ui/core/TextField'
import Tooltip from '@material-ui/core/Tooltip'
import TReports from '../templates/TReports'
import Typography from '@material-ui/core/Typography'

const useStyles = makeStyles(theme => ({
  appbar: {
    borderBottomColor: theme.palette.grey[300],
    borderBottomStyle: 'solid',
    borderBottomWidth: 1,
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
  number: {
    paddingTop: '4px',
    '& input': {
      fontSize: '14px',
      '&::placeholder': {
        color: '#01c8c8',
        opacity: 1,
      },
    },
    '&.Mui-error input': {
      color: '#f44336',
      '&::placeholder': {
        color: '#f44336',
      },
    },
  },
  text: {
    paddingTop: '6px !important',
    '& textarea': {
      fontSize: '14px',
    },
  },
  summary: {
    '& td': {
      border: 0,
      paddingTop: 36,
    },
  },
  heading: {
    paddingTop: 32,
    borderBottom: 0,
  },
  tableHead: {
    '& td': {
      color: '#767676',
    },
  },
}))

const MFormNumber = ({
  autoFocus,
  control,
  disabled,
  defaultValue = '',
  errors,
  label,
  name,
  rules = {
    validate: value => {
      if (isNaN(value)) {
        return String(value).includes(',')
          ? 'Please enter a number without commas'
          : 'Please enter a number'
      }

      return true
    },
    required: { value: true, message: 'Please enter a number' },
  },
}) => {
  const classes = useStyles()

  const transform = {
    input: value => (isNaN(value) ? '' : value.toString()),
    output: e => {
      const output = parseInt(e.target.value, 10)
      return isNaN(output) ? 0 : output
    },
  }

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      render={({ value, name, onBlur, onChange }) => (
        <Fragment>
          <InputBase
            label={label}
            name={name}
            // value={value}
            size="small"
            inputProps={{ disabled: disabled }}
            placeholder="Enter value"
            error={!!get(errors, name)}
            className={classes.number}
            // onChange={onChange}
            onChange={e => onChange(transform.output(e))}
            value={transform.input(value)}
            onBlur={onBlur}
            fullWidth
            autoFocus={autoFocus}
          />
          {!!get(errors, name) && (
            <Typography
              variant="caption"
              display="block"
              style={{ paddingBottom: '4px' }}
            >
              {get(errors, name).message}
            </Typography>
          )}
        </Fragment>
      )}
      rules={rules}
    />
  )
}

const MFormTextField = ({
  control,
  defaultValue = '',
  errors,
  label,
  name,
  disabled,
}) => {
  const classes = useStyles()

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      render={({ value, name, onBlur, onChange }) => (
        <Fragment>
          <InputBase
            label={label}
            name={name}
            value={value}
            size="small"
            className={classes.text}
            inputProps={{ disabled: disabled }}
            placeholder="—"
            multiline
            error={!!get(errors, name)}
            onChange={onChange}
            onBlur={onBlur}
            fullWidth
          />
        </Fragment>
      )}
    />
  )
}

const Line = ({
  bold,
  border,
  children,
  control,
  disabled,
  errors,
  name,
  label,
  value,
  defaultValue,
}) => {
  const classes = useStyles()

  return (
    <TableRow>
      <TableCell
        style={{
          verticalAlign: 'top',
          paddingTop: '11px',
          fontWeight: bold ? 500 : 400,
        }}
      >
        {label}
      </TableCell>
      <TableCell
        style={{
          verticalAlign: 'top',
          fontWeight: bold ? 500 : 400,
        }}
      >
        {children && (
          <Box style={{ paddingTop: '5px', paddingBottom: '7px' }}>
            {children}
          </Box>
        )}
        {!children && (
          <Fragment>
            {typeof value === 'undefined' && (
              <MFormNumber
                className={classes.input}
                control={control}
                name={name}
                errors={errors}
                placeholder="Enter value"
                defaultValue={defaultValue}
                disabled={disabled}
              />
            )}
            {typeof value !== 'undefined' && (
              <Box style={{ paddingTop: '5px', paddingBottom: '7px' }}>
                {value === false ? '—' : ''}
                {!isNaN(value) ? `USh ${numeral(value).format('0,0')}` : ''}
              </Box>
            )}
          </Fragment>
        )}
      </TableCell>
      <TableCell style={{ verticalAlign: 'top' }}>
        {!children && typeof value === 'undefined' && (
          <MFormTextField
            className={classes.input}
            control={control}
            name={`${name}Notes`}
            errors={errors}
            placeholder="Notes"
            disabled={disabled}
          />
        )}
      </TableCell>
    </TableRow>
  )
}

const useCashAtHandLogic = () => {
  const { branchId: branchIdFromAuth = null, role } = useUserProfile()

  const [params, setQueryParams] = useQueryString()

  const { branchId, date } = params

  const { data: branches, isLoading: isBranchesLoading } = useSecureBranches({
    role,
    branchId: branchIdFromAuth,
  })

  const branch = useMemo(() => {
    if (branches) {
      return branches.find(branch => branch._id === branchId)
    }

    return null
  }, [branches, branchId])

  const minDate = useMemo(() => {
    if (branch) {
      return moment(branch.initDate).tz(timezone).toDate()
    }

    return undefined
  }, [branch])

  const [selectedDate, setSelectedDate] = useState(
    date
      ? moment(date, timeFormat.default).tz(timezone).toDate()
      : moment().tz(timezone).toDate()
  )

  const handlePreviousPress = useCallback(() => {
    setSelectedDate(
      moment(selectedDate).tz(timezone).subtract(1, 'day').toDate()
    )
  }, [selectedDate])

  const handleNextPress = useCallback(() => {
    setSelectedDate(moment(selectedDate).tz(timezone).add(1, 'day').toDate())
  }, [selectedDate])

  const handleTodayPress = useCallback(() => {
    setSelectedDate(moment().tz(timezone).toDate())
  }, [])

  const goToDate = useCallback(date => {
    setSelectedDate(moment(date, timeFormat.default).tz(timezone).toDate())
  }, [])

  const handleBranchIdChange = useCallback(
    event => {
      setQueryParams({
        date,
        branchId: event.target.value,
      })
    },
    [setQueryParams, date]
  )

  const handleDateChange = date => setSelectedDate(date)

  useEffect(() => {
    if (selectedDate && minDate) {
      if (moment(selectedDate).tz(timezone).isBefore(minDate)) {
        handleDateChange(minDate)
      }
    }

    const now = moment().tz(timezone)

    if (selectedDate && moment(selectedDate).tz(timezone).isAfter(now)) {
      handleDateChange(now)
    }
  }, [selectedDate, minDate])

  useEffect(() => {
    const date = moment(selectedDate).tz(timezone).format(timeFormat.default)

    setQueryParams({
      date,
      branchId,
    })
  }, [selectedDate, setQueryParams, branchId])

  useEffect(() => {
    if (role === 'branchManager' && branchIdFromAuth && date) {
      setQueryParams({
        date,
        branchId: branchIdFromAuth,
      })
    }
  }, [branchIdFromAuth, setQueryParams, date, role])

  useEffect(() => {
    if ((role === 'admin' || role === 'areaManager' || role === 'regionalManager') && !branchId && branches && branches.length !== 0) {
      setQueryParams({
        date,
        branchId: branches[0]._id,
      })
    }
  }, [branches, setQueryParams, date, role, branchId])

  return {
    minDate,
    selectedDate,
    branchId,
    date,
    goToDate,
    handlePreviousPress,
    handleNextPress,
    handleTodayPress,
    handleBranchIdChange,
    handleDateChange,
    branches,
    isAdmin: role === 'admin',
    isAreaOrRegionalManager:  role === 'areaManager' || role === 'regionalManager',
    isBranchesLoading,
  }
}

const doesFallOnHoliday = (holidays, date, futureOnly = true) => {
  if (
    futureOnly &&
    !moment(date).tz(timezone).isAfter(moment().tz(timezone), 'day')
  ) {
    return
  }

  for (let i = 0; i < holidays.length; i++) {
    const holiday = holidays[i]

    let startAt = moment(holiday.startAt).tz(timezone)
    let endAt = moment(holiday.endAt).tz(timezone)

    if (holiday.yearly) {
      const shouldAddYearToEndAt = Number(endAt.year()) > Number(startAt.year())

      const currentYear = moment(date).tz(timezone).year()

      startAt.year(currentYear)

      endAt.year(shouldAddYearToEndAt ? currentYear + 1 : currentYear)
    }

    if (moment(date).tz(timezone).isBetween(startAt, endAt, 'day', '[]')) {
      return true
    }
  }

  return false
}

const PReportsCashAtHand = () => {
  const ref = useRef()

  const queryClient = useQueryClient()

  const classes = useStyles()

  const { _id: userId } = useUserProfile()

  const {
    selectedDate,
    branchId,
    date,
    minDate,
    goToDate,
    handlePreviousPress,
    handleNextPress,
    handleTodayPress,
    handleBranchIdChange,
    handleDateChange,
    branches,
    isAdmin,
    isAreaOrRegionalManager,
    isBranchesLoading,
  } = useCashAtHandLogic()

  const { data: holidays = [] } = useHolidays()

  const [selectedDate2, setSelectedDate2] = useState(
    moment().tz(timezone).subtract(1, 'month').toDate()
  )
  const [selectedDate3, setSelectedDate3] = useState(moment().toDate())
  const [isClosingTheDay, setIsClosingTheDay] = useState(false)
  const [closeTheDayDialog, setCloseTheDayDialog] = useState(false)
  const [exportDialog, setExportDialog] = useState(false)
  const [unlockDialog, setUnlockDialog] = useState(false)

  const openCloseTheDayDialog = () => {
    setCloseTheDayDialog(true)
  }

  const closeCloseTheDayDialog = () => {
    setCloseTheDayDialog(false)
  }

  const openExportDialog = () => {
    setExportDialog(true)
  }

  const closeExportDialog = () => {
    setExportDialog(false)
  }

  const openUnlockDialog = () => {
    setUnlockDialog(true)
  }

  const closeUnlockDialog = () => {
    setUnlockDialog(false)
  }

  const [closed, setClosed] = useState(false)
  const [errorsBelow, setErrorsBelow] = useState(false)

  const { control, handleSubmit, errors, reset, watch } = useForm({})
  const [whyUnlock, setWhyUnlock] = useState('')

  const { mutate } = useInsertEvent({
    onMutate: async cashAtHandForm => {
      queryClient.cancelQueries([
        'cashAtHandForm',
        branchId,
        moment(selectedDate).format(timeFormat.default),
      ])

      queryClient.setQueryData(
        [
          'cashAtHandForm',
          branchId,
          moment(selectedDate).format(timeFormat.default),
        ],
        () => cashAtHandForm
      )
    },
  })

  const { data: initValues, isFetching: isFetchingInitValues } =
    useInitCashAtHandReport({
      branchId,
      date,
    })

  const { mutate: openReport } = useOpenCashAtHandReport()

  const { mutate: exportReport, isLoading: isExporting } =
    useExportCashAtHandReport()

  const { data: cashAtHandForm = null, isLoading } = useCashAtHandForm({
    branchId,
    date,
  })

  const { data: { canClose = false, lastOpenDate } = {} } =
    useCanCloseCashAtHandReport({
      branchId,
      date: date ? date : moment().format(timeFormat.default),
    })

  const { cannotShow, isFuture, isHoliday, isWeekendDay } = useMemo(() => {
    const dateToCheck = moment(date, timeFormat.default).tz(timezone)
    const isWeekendDay = dateToCheck.isoWeekday() >= 6
    const isHoliday = doesFallOnHoliday(holidays, dateToCheck, false)
    const isFuture = dateToCheck.isAfter(
      moment(lastOpenDate, timeFormat.default).tz(timezone),
      'day'
    )
    const isPast =
      minDate && dateToCheck.isBefore(minDate, 'day') ? true : false
    const cannotShow = isHoliday || isWeekendDay || isFuture

    const result = {
      isFuture,
      isPast,
      isWeekendDay,
      isHoliday,
      cannotShow,
    }

    return result
  }, [date, minDate, holidays, canClose, lastOpenDate])

  useEffect(() => {
    if (!date && lastOpenDate) {
      goToDate(lastOpenDate)
    }
  }, [date, goToDate, lastOpenDate])

  useEffect(() => {
    if (!isLoading && cashAtHandForm !== null) {
      const {
        branchId,
        date,
        openingBalance,
        closingBalance,
        closed,
        ...initialValues
      } = cashAtHandForm
      reset(initialValues)
      setClosed(closed)
    } else if (cashAtHandForm === null) {
      reset({
        receipts: {
          fromHeadOffice: '',
          fromOtherBranches: '',
          bankWithdrawal: '',
          otherIncome: '',
          admissionFees: '',
          passbookFees: '',
          loanProcessingFees: '',
          loanInsurance: '',
        },
        payments: {
          toHeadOffice: '',
          toOtherBranches: '',
          expenses: {
            rent: '',
            utilities: '',
            staffTransport: '',
            staffLunch: '',
            staffAirtime: '',
            officeManagement: '',
            internet: '',
            insuranceClaim: '',
            rubbishCollection: '',
            miscellaneous: '',
          },
          bankDeposit: '',
        },
      })
      setClosed(false)
    }
  }, [cashAtHandForm, isLoading, reset])

  const receiptsFromHeadOffice = watch('receipts.fromHeadOffice', 0)
  const receiptsFromOtherBranches = watch('receipts.fromOtherBranches', 0)
  const receiptsBankWithdrawal = watch('receipts.bankWithdrawal', 0)
  const receiptsOtherIncome = watch('receipts.otherIncome', 0)
  const receiptsAdmissionFees = watch('receipts.admissionFees', 0)
  const receiptsPassbookFees = watch('receipts.passbookFees', 0)
  const receiptsLoanProcessingFees = watch('receipts.loanProcessingFees', 0)
  const receiptsLoanInsurance = watch('receipts.loanInsurance', 0)

  const paymentsToHeadOffice = watch('payments.toHeadOffice', 0)
  const paymentsToOtherBranches = watch('payments.toOtherBranches', 0)
  const paymentsExpensesRent = watch('payments.expenses.rent', 0)
  const paymentsExpensesUtilities = watch('payments.expenses.utilities', 0)
  const paymentsExpensesStaffTransport = watch(
    'payments.expenses.staffTransport'
  )
  const paymentsExpensesStaffLunch = watch('payments.expenses.staffLunch', 0)
  const paymentsExpensesStaffAirtime = watch(
    'payments.expenses.staffAirtime',
    0
  )
  const paymentsExpensesOfficeManagement = watch(
    'payments.expenses.officeManagement',
    0
  )
  const paymentsExpensesInternet = watch('payments.expenses.internet', 0)
  const paymentsExpensesInsuranceClaim = watch(
    'payments.expenses.insuranceClaim',
    0
  )
  const paymentsExpensesRubbishCollection = watch(
    'payments.expenses.rubbishCollection',
    0
  )
  const paymentsExpensesMiscellaneous = watch(
    'payments.expenses.miscellaneous',
    0
  )
  const paymentsBankDeposit = watch('payments.bankDeposit', 0)

  const securityWithdrawals = initValues?.securityWithdrawals ?? 0
  const loanDisbursements = initValues?.loanDisbursements ?? 0
  const openingBalance = initValues?.openingBalance ?? 0
  const loanRelatedFundsReceived = initValues?.loanRelatedFundsReceived ?? 0

  const admissionFees = initValues?.admissionFees ?? 0
  const passbookFees = initValues?.passbookFees ?? 0
  const loanInsurance = initValues?.loanInsurance ?? 0
  const loanProcessingFees = initValues?.loanProcessingFees ?? 0
  const todaysRealizations = initValues?.todaysRealizations ?? 0
  const securityPayments = initValues?.securityPayments ?? 0

  const meta = initValues?.meta ? JSON.parse(initValues.meta) : {}

  const outsideFundsReceived = useMemo(() => {
    const sum =
      Number(receiptsFromHeadOffice) +
      Number(receiptsFromOtherBranches) +
      Number(receiptsBankWithdrawal) +
      Number(receiptsAdmissionFees) +
      Number(receiptsPassbookFees) +
      Number(receiptsLoanProcessingFees) +
      Number(receiptsLoanInsurance) +
      Number(receiptsOtherIncome)

    if (isNaN(sum)) {
      return 0
    }

    return sum
  }, [
    receiptsFromHeadOffice,
    receiptsFromOtherBranches,
    receiptsBankWithdrawal,
    receiptsAdmissionFees,
    receiptsPassbookFees,
    receiptsLoanProcessingFees,
    receiptsLoanInsurance,
    receiptsOtherIncome,
  ])

  const fundsTransferredOut = useMemo(() => {
    const sum = Number(paymentsToHeadOffice) + Number(paymentsToOtherBranches)

    if (isNaN(sum)) {
      return 0
    }
    return sum
  }, [paymentsToHeadOffice, paymentsToOtherBranches])

  const otherExpenses = useMemo(() => {
    const sum =
      Number(paymentsExpensesRent) +
      Number(paymentsExpensesUtilities) +
      Number(paymentsExpensesStaffTransport) +
      Number(paymentsExpensesStaffLunch) +
      Number(paymentsExpensesStaffAirtime) +
      Number(paymentsExpensesOfficeManagement) +
      Number(paymentsExpensesInternet) +
      Number(paymentsExpensesInsuranceClaim) +
      Number(paymentsExpensesRubbishCollection) +
      Number(paymentsExpensesMiscellaneous)

    if (isNaN(sum)) {
      return 0
    }

    return sum
  }, [
    paymentsExpensesRent,
    paymentsExpensesUtilities,
    paymentsExpensesStaffTransport,
    paymentsExpensesStaffLunch,
    paymentsExpensesStaffAirtime,
    paymentsExpensesOfficeManagement,
    paymentsExpensesInternet,
    paymentsExpensesInsuranceClaim,
    paymentsExpensesRubbishCollection,
    paymentsExpensesMiscellaneous,
  ])

  const totalPayments = useMemo(() => {
    const sum =
      Number(loanDisbursements || 0) +
      Number(securityWithdrawals || 0) +
      Number(fundsTransferredOut || 0) +
      Number(otherExpenses || 0) +
      Number(paymentsBankDeposit || 0)

    if (isNaN(sum)) {
      return 0
    }
    return sum
  }, [
    fundsTransferredOut,
    loanDisbursements,
    otherExpenses,
    paymentsBankDeposit,
    securityWithdrawals,
  ])

  const cashInHand = useMemo(() => {
    const sum =
      openingBalance +
      outsideFundsReceived +
      loanRelatedFundsReceived -
      totalPayments

    if (isNaN(sum)) {
      return 0
    }

    return sum
  }, [
    openingBalance,
    outsideFundsReceived,
    loanRelatedFundsReceived,
    totalPayments,
  ])

  const handleExport = () => {
    exportReport(
      {
        start: moment(selectedDate2).tz(timezone).format(timeFormat.default),
        end: moment(selectedDate3).tz(timezone).format(timeFormat.default),
      },
      {
        onError: () => {
          closeExportDialog()
        },
        onSuccess: url => {
          closeExportDialog()
          window.open(url, '_self')
        },
      }
    )
  }

  const handleUnlock = useCallback(() => {
    const payload = {
      branchId,
      date,
      unlockReason: whyUnlock,
    }

    openReport(payload, {
      onError: () => {
        closeUnlockDialog()
      },
      onSuccess: () => {
        queryClient.invalidateQueries(['cashAtHandForm', branchId, date])
        queryClient.invalidateQueries([
          'canCloseCashAtHandReport',
          branchId,
          date,
        ])
        closeUnlockDialog()
      },
    })
  }, [branchId, date, openReport, queryClient, whyUnlock])

  const handleDateChange2 = date => {
    setSelectedDate2(date)
  }

  const handleDateChange3 = date => {
    setSelectedDate3(date)
  }

  const canGoForward = useMemo(() => {
    const now = moment().tz(timezone)
    const date = moment(selectedDate).tz(timezone)

    return date.isBefore(now, 'day')
  }, [selectedDate])

  const canGoBack = useMemo(() => {
    return moment(selectedDate).tz(timezone).isAfter(minDate, 'day')
  }, [selectedDate, minDate])

  const renderPlaceholder = useCallback(() => {
    return (
      <Box
        flexGrow={1}
        width="100%"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Box textAlign="center" paddingBottom={4}>
          <TableChartIcon />
          <Box paddingBottom={1}>
            <Typography variant="h2">
              {isFuture &&
                !isWeekendDay &&
                !isHoliday &&
                'You can not fill out the report in advance'}
              {!canGoBack &&
                !isWeekendDay &&
                !isHoliday &&
                'No data for this day'}
              {isWeekendDay &&
                'You can not fill out the report during a weekend'}
              {isHoliday && 'You can not fill out the report during a holiday'}
            </Typography>
            <Typography variant="body1">
              {moment(date, timeFormat.default)
                .tz(timezone)
                .format('dddd, DD.MM.YYYY')}
            </Typography>
          </Box>
          <Box style={{ height: 36 }}>
            {!isLoading && lastOpenDate && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => goToDate(lastOpenDate)}
              >
                {String(lastOpenDate) ===
                String(moment().tz(timezone).format(timeFormat.default))
                  ? 'Show today'
                  : 'Show the open day'}
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    )
  }, [
    isLoading,
    isFuture,
    isWeekendDay,
    isHoliday,
    canGoBack,
    date,
    lastOpenDate,
    goToDate,
  ])

  const onError = () => {
    setErrorsBelow(true)
    setIsClosingTheDay(false)
    setCloseTheDayDialog(false)
    closeCloseTheDayDialog()

    ref.current.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const onSubmit = data => {
    setIsClosingTheDay(true)

    const payload = {
      branchId,
      _id: cashAtHandForm?._id ?? undefined,
      date: moment(selectedDate).tz(timezone).format(timeFormat.default),
      dateIso: moment(selectedDate, timeFormat.default)
        .tz(timezone)
        .startOf('day')
        .add(12, 'hours') // Hack
        .toDate(),
      openingBalance,
      closingBalance: cashInHand,
      closed: true,
      ...data,
    }

    payload.receipts.loanRelatedFundsReceived = loanRelatedFundsReceived
    payload.payments.loanDisbursements = loanDisbursements
    payload.payments.securityWithdrawals = securityWithdrawals

    setErrorsBelow(false)

    mutate(
      {
        type: cashAtHandForm?._id ? 'update' : 'create',
        obj: 'cashAtHandForm',
        ...payload,
      },
      {
        onError: () => {
          closeCloseTheDayDialog()
        },
        onSuccess: () => {
          queryClient.invalidateQueries([
            'cashAtHandForm',
            branchId,
            moment(selectedDate).format(timeFormat.default),
          ])
          setIsClosingTheDay(false)
          closeCloseTheDayDialog()
        },
      }
    )
  }

  return (
    <TReports active="/reports/cash-at-hand">
      <form onSubmit={handleSubmit(onSubmit, onError)} className={classes.form}>
        <Box
          display="flex"
          alignItems="center"
          className={classes.bar}
          flexShrink={0}
          pl={1}
        >
          <Box paddingBottom={1} display="flex" alignItems="center">
            <IconButton
              color="primary"
              style={{ marginTop: '8px', marginLeft: '4px' }}
              disabled={!canGoBack}
              size="small"
              onClick={handlePreviousPress}
            >
              <ArrowBackIcon />
            </IconButton>
            <Button style={{ marginTop: '8px' }} onClick={handleTodayPress}>
              Today
            </Button>
            <IconButton
              color="primary"
              style={{ marginTop: '8px', marginRight: '16px' }}
              disabled={!canGoForward}
              onClick={handleNextPress}
              size="small"
            >
              <ArrowForwardIcon />
            </IconButton>
            <Box style={{ paddingTop: 13, paddingRight: 18 }}>
              {!isWeekendDay && !isHoliday && (
                <Tooltip
                  title={`The day is ${closed ? 'closed' : 'opened'}`}
                  placement="top"
                  arrow
                >
                  {closed ? <LockIcon /> : <LockOpenIcon />}
                </Tooltip>
              )}
              {(isWeekendDay || isHoliday) && (
                <Tooltip
                  title={isWeekendDay ? 'Weekend' : 'Holiday'}
                  placement="top"
                  arrow
                >
                  <NoEncryptionOutlinedIcon />
                </Tooltip>
              )}
            </Box>
            <KeyboardDatePicker
              allowKeyboardControl={false}
              disableToolbar
              minDate={moment(minDate).tz(timezone).add(12, 'hours').toDate()}
              maxDate={moment().tz(timezone).toDate()}
              autoOk
              label="Day"
              variant="inline"
              format={timeFormat.default}
              margin="normal"
              inputVariant="outlined"
              value={selectedDate}
              onChange={handleDateChange}
              style={{ width: '170px' }}
              KeyboardButtonProps={{
                'aria-label': 'change date',
              }}
            />
            {(isAdmin || isAreaOrRegionalManager) && branchId && !isBranchesLoading && (
              <FormControl
                variant="outlined"
                style={{
                  marginTop: '12px',
                  marginLeft: '16px',
                  width: '200px',
                }}
              >
                <InputLabel htmlFor="outlined-branch">Branch</InputLabel>
                <Select
                  value={branchId}
                  onChange={handleBranchIdChange}
                  label="Branch"
                  inputProps={{
                    name: 'branch',
                    id: 'outlined-branch',
                  }}
                >
                  {branches.map(branch => (
                    <MenuItem value={branch._id} key={branch._id}>
                      {branch.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
          <Box flexGrow={1} />
          {(isAdmin || isAreaOrRegionalManager) && (
            <Fragment>
              {isExporting && (
                <CircularProgress
                  color="secondary"
                  size={24}
                  style={{ marginRight: '26px' }}
                />
              )}
              {!isExporting && (
                <Button
                  style={{
                    marginRight: '16px',
                    height: '40px',
                  }}
                  onClick={openExportDialog}
                >
                  Export
                </Button>
              )}
            </Fragment>
          )}
        </Box>
        {cannotShow && renderPlaceholder()}
        {!cannotShow && !isLoading && !isFetchingInitValues && (
          <Box
            flexGrow={1}
            width="100%"
            overflow="auto"
            display="flex"
            justifyContent="center"
            pl={2}
            pr={1}
            ref={ref}
          >
            <Box display="flex" justifyContent="center">
              <Box width={800}>
                <Table>
                  <TableBody>
                    {errorsBelow && (
                      <TableRow className={classes.summary}>
                        <TableCell colSpan={3}>
                          <Typography
                            variant="body2"
                            color="error"
                            style={{ marginBottom: -12 }}
                          >
                            Please correct errors below:
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow className={classes.summary}>
                      <TableCell style={{ width: '33.3%', fontWeight: 500 }}>
                        Opening cash at hand
                      </TableCell>
                      <TableCell style={{ width: '33.3%', fontWeight: 500 }}>
                        USh {numeral(openingBalance).format('0,0')}
                      </TableCell>
                      <TableCell style={{ width: '33.3%', textAlign: 'right' }}>
                        {isLoading && (
                          <CircularProgress color="secondary" size={16} />
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={3} className={classes.heading}>
                        <Typography variant="h2">Receipts</Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow className={classes.tableHead}>
                      <TableCell>Name</TableCell>
                      <TableCell>Value</TableCell>
                      <TableCell>Comments</TableCell>
                    </TableRow>
                    <Line
                      label="From the head office (cash)"
                      name="receipts.fromHeadOffice"
                      control={control}
                      errors={errors}
                      disabled={closed}
                    />
                    <Line
                      label="From other branches (cash)"
                      name="receipts.fromOtherBranches"
                      control={control}
                      errors={errors}
                      disabled={closed}
                    />
                    <Line
                      label="Bank withdrawal"
                      name="receipts.bankWithdrawal"
                      control={control}
                      errors={errors}
                      disabled={closed}
                    />
                    <Line
                      label="Admission fees"
                      name="receipts.admissionFees"
                      control={control}
                      value={admissionFees}
                      errors={errors}
                      disabled={closed}
                    />
                    <Line
                      label="Passbook fees"
                      name="receipts.passbookFees"
                      control={control}
                      value={passbookFees}
                      errors={errors}
                      disabled={closed}
                    />
                    <Line
                      label="Loan processing fees"
                      name="receipts.loanProcessingFees"
                      control={control}
                      value={loanProcessingFees}
                      errors={errors}
                      disabled={closed}
                    />
                    <Line
                      label="Loan insurance"
                      name="receipts.loanInsurance"
                      control={control}
                      value={loanInsurance}
                      errors={errors}
                      disabled={closed}
                    />
                    <Line
                      label="Other income"
                      name="receipts.otherIncome"
                      control={control}
                      errors={errors}
                      disabled={closed}
                    />
                    {/* <Line label="Loan–related funds received">
                      USh {numeral(loanRelatedFundsReceived).format('0,0')}
                    </Line> */}
                    <Line label="Today's realizations">
                      USh {numeral(todaysRealizations).format('0,0')}
                    </Line>
                    <Line label="Security deposits">
                      USh {numeral(securityPayments).format('0,0')}
                    </Line>
                    <Line label="Total receipts" bold>
                      USh{' '}
                      {numeral(
                        outsideFundsReceived + loanRelatedFundsReceived
                      ).format('0,0')}
                    </Line>
                    <TableRow>
                      <TableCell colSpan={3} className={classes.heading}>
                        <Typography variant="h2">Payments</Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow className={classes.tableHead}>
                      <TableCell>Name</TableCell>
                      <TableCell>Value</TableCell>
                      <TableCell>Comments</TableCell>
                    </TableRow>
                    <Line label="Loan disbursements" bold>
                      USh {numeral(loanDisbursements).format('0,0')}
                    </Line>
                    <Line label="Security withdrawals" bold>
                      USh {numeral(securityWithdrawals).format('0,0')}
                    </Line>
                    <Line label="Funds transferred out" bold>
                      USh {numeral(fundsTransferredOut).format('0,0')}
                    </Line>
                    <Line
                      label="To the head office (cash)"
                      name="payments.toHeadOffice"
                      control={control}
                      errors={errors}
                      disabled={closed}
                    />
                    <Line
                      label="To other branches (cash)"
                      name="payments.toOtherBranches"
                      control={control}
                      errors={errors}
                      disabled={closed}
                    />
                    <Line label="Other expenses" bold>
                      USh {numeral(otherExpenses).format('0,0')}
                    </Line>
                    <Line
                      label="Rent"
                      name="payments.expenses.rent"
                      control={control}
                      errors={errors}
                      disabled={closed}
                    />
                    <Line
                      label="Utilities (gas, electricity, water)"
                      name="payments.expenses.utilities"
                      control={control}
                      errors={errors}
                      disabled={closed}
                    />
                    <Line
                      label="Staff transport"
                      name="payments.expenses.staffTransport"
                      control={control}
                      errors={errors}
                      disabled={closed}
                    />
                    <Line
                      label="Staff lunch"
                      name="payments.expenses.staffLunch"
                      control={control}
                      errors={errors}
                      disabled={closed}
                    />
                    <Line
                      label="Staff airtime"
                      name="payments.expenses.staffAirtime"
                      control={control}
                      errors={errors}
                      disabled={closed}
                    />
                    <Line
                      label="Office management"
                      name="payments.expenses.officeManagement"
                      control={control}
                      errors={errors}
                      disabled={closed}
                    />
                    <Line
                      label="Internet expenses"
                      name="payments.expenses.internet"
                      control={control}
                      errors={errors}
                      disabled={closed}
                    />
                    <Line
                      label="Insurance claim"
                      name="payments.expenses.insuranceClaim"
                      control={control}
                      errors={errors}
                      disabled={closed}
                    />
                    <Line
                      label="Rubbish collection"
                      name="payments.expenses.rubbishCollection"
                      control={control}
                      errors={errors}
                      disabled={closed}
                    />
                    <Line
                      label="Miscellaneous"
                      name="payments.expenses.miscellaneous"
                      control={control}
                      errors={errors}
                      disabled={closed}
                    />
                    <Line
                      label="Deposit to the bank"
                      name="payments.bankDeposit"
                      bold
                      control={control}
                      errors={errors}
                      disabled={closed}
                    />
                    <Line label="Total payments" bold>
                      USh {numeral(totalPayments).format('0,0')}
                    </Line>
                    <TableRow className={classes.summary}>
                      <TableCell style={{ fontWeight: 500 }}>
                        Cash at hand
                      </TableCell>
                      <TableCell style={{ fontWeight: 500 }}>
                        USh {numeral(cashInHand).format('0,0')}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <Box flexShrink={0} pt={4} pb={8} pl={35}>
                  <Box display="flex" style={{ paddingLeft: 2 }}>
                    {!closed && !isAreaOrRegionalManager && (
                      <>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={openCloseTheDayDialog}
                          disabled={
                            (!canClose || lastOpenDate !== date) && !isLoading
                          }
                        >
                          Close the day
                        </Button>
                      </>
                    )}
                    {closed && isAdmin && (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => openUnlockDialog()}
                      >
                        Unlock
                      </Button>
                    )}
                    {closed && (
                      <Button
                        disabled
                        style={{ paddingLeft: isAdmin ? 16 : 0 }}
                      >
                        The day is closed
                      </Button>
                    )}
                  </Box>
                </Box>
                {[
                  '6022909476e0b1068a5e62ac', // Chris
                  '61b0a4634fa659f60b84bddf', // Hasan
                  '607ecc614ec19782b2039dfd', // Vinnie
                  '60460695f4ae1535b93fd61a', // Greg
                ].includes(String(userId)) && (
                  <Box pb={8}>
                    <Box p={4} pb={2} bgcolor="#ffffdd">
                      <Box pb={2}>
                        <strong>
                          Debug info visible only for certain users
                        </strong>
                      </Box>
                      {Object.keys(meta).map(key => {
                        const value = meta[key]

                        return (
                          <Box key={key} pb={2}>
                            {key}: {value}
                          </Box>
                        )
                      })}
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        )}
        {(isLoading || isFetchingInitValues) && !cannotShow && (
          <Box
            display="flex"
            flex={1}
            justifyContent="center"
            alignItems="center"
          >
            <CircularProgress color="secondary" />
          </Box>
        )}
      </form>
      <Dialog open={closeTheDayDialog} onClose={closeCloseTheDayDialog}>
        <DialogContent>Are you sure you want to close the day?</DialogContent>
        <DialogActions>
          {!isClosingTheDay && (
            <Fragment>
              <Button onClick={closeCloseTheDayDialog} color="primary">
                No
              </Button>
              <Button onClick={handleSubmit(onSubmit, onError)} color="primary">
                Yes
              </Button>
            </Fragment>
          )}
          {isClosingTheDay && (
            <Box pr={2} style={{ paddingBottom: '7px' }}>
              <CircularProgress color="secondary" size={24} />
            </Box>
          )}
        </DialogActions>
      </Dialog>
      <Dialog open={exportDialog} onClose={closeExportDialog}>
        <DialogTitle>Export a cash at hand report</DialogTitle>
        <DialogContent>
          <Box display="flex" pb={2}>
            <KeyboardDatePicker
              allowKeyboardControl={false}
              disableToolbar
              minDate={moment(selectedDate3)
                .tz(timezone)
                .subtract(31, 'days')
                .toDate()}
              maxDate={moment(selectedDate3).tz(timezone).toDate()}
              autoOk
              label="From"
              variant="inline"
              format={timeFormat.default}
              margin="normal"
              inputVariant="outlined"
              value={selectedDate2}
              onChange={handleDateChange2}
              style={{ width: '170px', marginRight: '8px' }}
              KeyboardButtonProps={{
                'aria-label': 'change date',
              }}
            />
            <KeyboardDatePicker
              allowKeyboardControl={false}
              disableToolbar
              minDate={moment(selectedDate2).tz(timezone).toDate()}
              maxDate={
                moment(selectedDate2).diff(moment(), 'days') > 31
                  ? moment().tz(timezone).toDate()
                  : moment(selectedDate2).tz(timezone).add(31, 'days').toDate()
              }
              autoOk
              label="To"
              variant="inline"
              format={timeFormat.default}
              margin="normal"
              inputVariant="outlined"
              value={selectedDate3}
              onChange={handleDateChange3}
              style={{ width: '170px' }}
              KeyboardButtonProps={{
                'aria-label': 'change date',
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          {!isExporting && (
            <Fragment>
              <Button color="primary" onClick={closeExportDialog}>
                Cancel
              </Button>
              <Button color="primary" onClick={handleExport}>
                Export
              </Button>
            </Fragment>
          )}
          {isExporting && (
            <Box pr={2} style={{ paddingBottom: '7px' }}>
              <CircularProgress color="secondary" size={24} />
            </Box>
          )}
        </DialogActions>
      </Dialog>
      <Dialog open={unlockDialog} onClose={closeUnlockDialog}>
        <DialogTitle id="form-dialog-title">Unlock the report</DialogTitle>
        <DialogContent style={{ width: '380px' }}>
          <TextField
            autoFocus
            margin="dense"
            label="Why are you unlocking the report? "
            fullWidth
            variant="outlined"
            multiline
            placeholder="Please describe"
            value={whyUnlock}
            onChange={e => setWhyUnlock(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => closeUnlockDialog()} color="primary">
            Cancel
          </Button>
          <Button
            disabled={String(whyUnlock).trim() === ''}
            onClick={handleUnlock}
            color="primary"
          >
            Unlock
          </Button>
        </DialogActions>
      </Dialog>
    </TReports>
  )
}

export default PReportsCashAtHand
