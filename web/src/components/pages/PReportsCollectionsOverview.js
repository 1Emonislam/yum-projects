import { KeyboardDatePicker } from '@material-ui/pickers'
import { makeStyles } from '@material-ui/core/styles'
import {
  timeFormat,
  useSecureBranches,
  useUserProfile,
  useLoanOfficerSummary,
  useGroupSummary,
  useClientSummary,
  useBmCollectionsOverview,
} from 'shared'
import { useQueryString } from 'use-route-as-state'
import Box from '@material-ui/core/Box'
import CircularProgress from '@material-ui/core/CircularProgress'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import moment from 'moment-timezone'
import numeral from 'numeral'
import React, { useCallback, useEffect, useState } from 'react'
import Select from '@material-ui/core/Select'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableHead from '@material-ui/core/TableHead'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import TReports from '../templates/TReports'
import Typography from '@material-ui/core/Typography'
import Breadcrumbs from '@material-ui/core/Breadcrumbs'
import Button from '@material-ui/core/Button'

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
      // border: 0,
      // paddingTop: 36,
    },
  },
  heading: {
    paddingTop: 32,
    borderBottom: 0,
  },
  thStringValue: {
    textAlign: 'left',
    fontWeight: 500,
  },
  thNumericValue: {
    textAlign: 'right',
    fontWeight: 500,
  },
  tr: {
    '&:hover': {
      backgroundColor: 'rgba(40, 183, 149, 0.2)',
      cursor: 'pointer',
    },
  },
}))

const useReportLogic = () => {
  const { branchId: branchIdFromAuth = null, role } = useUserProfile()
  const [params, setQueryParams] = useQueryString()
  const { branchId, date } = params

  const { data: branches, isLoading: isBranchesLoading } = useSecureBranches({
    role,
    branchId: branchIdFromAuth,
  })

  const [selectedDate, setSelectedDate] = useState(
    date ? moment(date, timeFormat.default).toDate() : moment().toDate()
  )

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
    const date = moment(selectedDate).format(timeFormat.default)

    setQueryParams({
      date,
      branchId,
    })
  }, [selectedDate, setQueryParams, branchId])

  // useEffect(() => {
  //   if (role === 'branchManager' && branchIdFromAuth && date) {
  //     setQueryParams({
  //       date,
  //       branchId: branchIdFromAuth,
  //     })
  //   }
  // }, [branchIdFromAuth, setQueryParams, date, role])

  useEffect(() => {
    if (!branchId && branches && branches.length !== 0) {
      setQueryParams({
        date,
        branchId: branches[0]._id,
      })
    }
  }, [branches, setQueryParams, date, role, branchId])

  return {
    selectedDate,
    branchId,
    date,
    handleBranchIdChange,
    handleDateChange,
    branches,
    isBranchesLoading,
  }
}

function BMCollectionsOverview({ data, classes }) {
  return (
    <Box paddingBottom={8}>
      <Typography
        variant="h2"
        style={{ marginTop: '1rem', marginBottom: '1rem' }}
      >
        BM collections overview
      </Typography>
      <Table>
        <TableHead>
          <TableRow className={classes.summary}>
            <TableCell className={classes.thStringValue}>
              Realization (cash)
            </TableCell>
            <TableCell className={classes.thNumericValue}>
              Realization (security)
            </TableCell>
            <TableCell className={classes.thStringValue}>
              Loan Officer
            </TableCell>
            <TableCell className={classes.thStringValue}>
              Client Group
            </TableCell>
            <TableCell className={classes.thStringValue}>Client</TableCell>
            {/* <TableCell className={classes.thStringValue}>
              Meeting Date
            </TableCell> */}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, idx) => (
            <TableRow key={idx} style={{ display: 'table-row' }}>
              <TableCell style={{ textAlign: 'right' }}>
                {numeral(row.todaysRealizationCash).format('0,0')}
              </TableCell>
              <TableCell style={{ textAlign: 'right' }}>
                {numeral(row.todaysRealizationSecurity).format('0,0')}
              </TableCell>
              <TableCell>{row.loanOfficerName}</TableCell>
              <TableCell>{row.clientGroupName}</TableCell>
              <TableCell>{row.clientName}</TableCell>
              {/* <TableCell style={{ textAlign: 'right' }}>
                {moment(row.meetingScheduledDate).format(timeFormat.default)}
              </TableCell> */}
            </TableRow>
          ))}
          <TableRow style={{ display: 'table-row' }}>
            <TableCell style={{ textAlign: 'right' }}>
              Total: USh{' '}
              {numeral(
                data.reduce((acc, row) => acc + row.todaysRealizationCash, 0)
              ).format('0,0')}
            </TableCell>
            <TableCell style={{ textAlign: 'right' }}>
              Total: USh{' '}
              {numeral(
                data.reduce(
                  (acc, row) => acc + row.todaysRealizationSecurity,
                  0
                )
              ).format('0,0')}
            </TableCell>
            <TableCell></TableCell>
            <TableCell></TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Box>
  )
}

function LoanOfficerSummary({
  branchId,
  date,
  setSelectedLoanOfficer,
  classes,
  setCurrentView,
}) {
  const { data: loSummaryData = [], isFetching } = useLoanOfficerSummary({
    branchId,
    date,
  })

  const {
    data: bmCollectionsOverviewData = [],
    isFetchingBmCollectionsOverview,
  } = useBmCollectionsOverview({
    branchId,
    date,
  })

  return (
    <>
      {!isFetching && !isFetchingBmCollectionsOverview && (
        <Box
          flexGrow={1}
          width="100%"
          overflow="auto"
          display="flex"
          justifyContent="center"
          pl={2}
          pr={1}
        >
          <Box display="flex" flexDirection="column">
            <Box marginBottom={3}>
              <Typography
                variant="h2"
                style={{ marginTop: '1rem', marginBottom: '1rem' }}
              >
                Loan officer summary
              </Typography>
              <Table>
                <TableHead>
                  <TableRow className={classes.summary}>
                    <TableCell className={classes.thStringValue}>
                      LO Name
                    </TableCell>
                    <TableCell className={classes.thNumericValue}>
                      Realizable
                    </TableCell>
                    <TableCell className={classes.thNumericValue}>
                      Realization
                    </TableCell>
                    <TableCell className={classes.thNumericValue}>
                      Advance
                    </TableCell>
                    <TableCell className={classes.thNumericValue}>
                      OD collection
                    </TableCell>
                    <TableCell className={classes.thNumericValue}>
                      New overdue
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loSummaryData.map(row => (
                    <TableRow
                      className={classes.tr}
                      key={row.loanOfficerId}
                      style={{ display: 'table-row' }}
                      onClick={() => {
                        setSelectedLoanOfficer(row)
                        setCurrentView('group')
                      }}
                    >
                      <TableCell style={{ textAlign: 'left' }}>
                        {row.loanOfficerName}
                      </TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        {numeral(row.realizable).format('0,0')}
                      </TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        {numeral(row.realization).format('0,0')}
                      </TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        {numeral(row.advance).format('0,0')}
                      </TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        {numeral(row.odCollection).format('0,0')}
                      </TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        {numeral(row.newOverdue).format('0,0')}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow
                    className={classes.summary}
                    style={{ display: 'table-row' }}
                  >
                    <TableCell
                      style={{ textAlign: 'left', fontWeight: 'bold' }}
                    >
                      Total
                    </TableCell>
                    <TableCell
                      style={{ textAlign: 'right', fontWeight: 'bold' }}
                    >
                      {numeral(
                        loSummaryData.reduce(
                          (acc, row) => acc + row.realizable,
                          0
                        )
                      ).format('0,0')}
                    </TableCell>
                    <TableCell
                      style={{ textAlign: 'right', fontWeight: 'bold' }}
                    >
                      {numeral(
                        loSummaryData.reduce(
                          (acc, row) => acc + row.realization,
                          0
                        )
                      ).format('0,0')}
                    </TableCell>
                    <TableCell
                      style={{ textAlign: 'right', fontWeight: 'bold' }}
                    >
                      {numeral(
                        loSummaryData.reduce((acc, row) => acc + row.advance, 0)
                      ).format('0,0')}
                    </TableCell>
                    <TableCell
                      style={{ textAlign: 'right', fontWeight: 'bold' }}
                    >
                      {numeral(
                        loSummaryData.reduce(
                          (acc, row) => acc + row.odCollection,
                          0
                        )
                      ).format('0,0')}
                    </TableCell>
                    <TableCell
                      style={{ textAlign: 'right', fontWeight: 'bold' }}
                    >
                      {numeral(
                        loSummaryData.reduce(
                          (acc, row) => acc + row.newOverdue,
                          0
                        )
                      ).format('0,0')}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
            <BMCollectionsOverview
              data={bmCollectionsOverviewData}
              classes={classes}
            />
          </Box>
        </Box>
      )}
      {(isFetching || isFetchingBmCollectionsOverview) && (
        <Box
          display="flex"
          flex={1}
          justifyContent="center"
          alignItems="center"
        >
          <CircularProgress color="secondary" />
        </Box>
      )}
    </>
  )
}

function GroupSummary({
  date,
  SelectedLoanOfficer,
  setSelectedLoanOfficer,
  setCurrentView,
  classes,
  setSelectedGroup,
  branchId,
}) {
  const { data: groupSummaryData = [], isFetching } = useGroupSummary({
    loanOfficerId: SelectedLoanOfficer.loanOfficerId,
    date,
  })

  const {
    data: bmCollectionsOverviewData = [],
    isFetchingBmCollectionsOverview,
  } = useBmCollectionsOverview({
    branchId,
    loanOfficerId: SelectedLoanOfficer.loanOfficerId,
    date,
  })

  return (
    <>
      {!isFetching && (
        <Box
          flexGrow={1}
          width="100%"
          overflow="auto"
          display="flex"
          justifyContent="center"
          pl={2}
          pr={1}
        >
          <Box display="flex" flexDirection="column">
            <Box marginBottom={3}>
              <Typography
                variant="h2"
                style={{ marginTop: '1rem', marginBottom: '1rem' }}
              >
                Group-wise summary
              </Typography>
              <Breadcrumbs aria-label="breadcrumb">
                <Button
                  variant="text"
                  onClick={() => {
                    setSelectedLoanOfficer(null)
                    setCurrentView('lo')
                  }}
                >
                  Loan officer summary
                </Button>
                <Typography color="primary">
                  {SelectedLoanOfficer.loanOfficerName}
                </Typography>
              </Breadcrumbs>
              <Table>
                <TableHead>
                  <TableRow className={classes.summary}>
                    <TableCell className={classes.thStringValue}>
                      Group Name
                    </TableCell>
                    <TableCell className={classes.thNumericValue}>
                      Realizable
                    </TableCell>
                    <TableCell className={classes.thNumericValue}>
                      Realization
                    </TableCell>
                    <TableCell className={classes.thNumericValue}>
                      Advance
                    </TableCell>
                    <TableCell className={classes.thNumericValue}>
                      OD collection
                    </TableCell>
                    <TableCell className={classes.thNumericValue}>
                      New overdue
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {groupSummaryData.map(row => (
                    <TableRow
                      className={classes.tr}
                      key={row.clientGroupId}
                      style={{ display: 'table-row' }}
                      onClick={() => {
                        setSelectedGroup(row)
                        setCurrentView('client')
                      }}
                    >
                      <TableCell style={{ textAlign: 'left' }}>
                        {row.clientGroupName}
                      </TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        {numeral(row.realizable).format('0,0')}
                      </TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        {numeral(row.realization).format('0,0')}
                      </TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        {numeral(row.advance).format('0,0')}
                      </TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        {numeral(row.odCollection).format('0,0')}
                      </TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        {numeral(row.newOverdue).format('0,0')}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow
                    className={classes.summary}
                    style={{ display: 'table-row' }}
                  >
                    <TableCell
                      style={{ textAlign: 'left', fontWeight: 'bold' }}
                    >
                      Total
                    </TableCell>
                    <TableCell
                      style={{ textAlign: 'right', fontWeight: 'bold' }}
                    >
                      {numeral(
                        groupSummaryData.reduce(
                          (acc, row) => acc + row.realizable,
                          0
                        )
                      ).format('0,0')}
                    </TableCell>
                    <TableCell
                      style={{ textAlign: 'right', fontWeight: 'bold' }}
                    >
                      {numeral(
                        groupSummaryData.reduce(
                          (acc, row) => acc + row.realization,
                          0
                        )
                      ).format('0,0')}
                    </TableCell>
                    <TableCell
                      style={{ textAlign: 'right', fontWeight: 'bold' }}
                    >
                      {numeral(
                        groupSummaryData.reduce(
                          (acc, row) => acc + row.advance,
                          0
                        )
                      ).format('0,0')}
                    </TableCell>
                    <TableCell
                      style={{ textAlign: 'right', fontWeight: 'bold' }}
                    >
                      {numeral(
                        groupSummaryData.reduce(
                          (acc, row) => acc + row.odCollection,
                          0
                        )
                      ).format('0,0')}
                    </TableCell>
                    <TableCell
                      style={{ textAlign: 'right', fontWeight: 'bold' }}
                    >
                      {numeral(
                        groupSummaryData.reduce(
                          (acc, row) => acc + row.newOverdue,
                          0
                        )
                      ).format('0,0')}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
            <BMCollectionsOverview
              data={bmCollectionsOverviewData}
              classes={classes}
            />
          </Box>
        </Box>
      )}
      {(isFetching || isFetchingBmCollectionsOverview) && (
        <Box
          display="flex"
          flex={1}
          justifyContent="center"
          alignItems="center"
        >
          <CircularProgress color="secondary" />
        </Box>
      )}
    </>
  )
}

function ClientSummary({
  date,
  SelectedLoanOfficer,
  SelectedGroup,
  setSelectedLoanOfficer,
  setSelectedGroup,
  setCurrentView,
  classes,
  branchId,
}) {
  const { data: clientSummaryData = [], isFetching } = useClientSummary({
    clientGroupId: SelectedGroup.clientGroupId,
    date,
  })

  const {
    data: bmCollectionsOverviewData = [],
    isFetchingBmCollectionsOverview,
  } = useBmCollectionsOverview({
    branchId,
    clientGroupId: SelectedGroup.clientGroupId,
    date,
  })

  return (
    <>
      {!isFetching && (
        <Box
          flexGrow={1}
          width="100%"
          overflow="auto"
          display="flex"
          justifyContent="center"
          pl={2}
          pr={1}
        >
          <Box display="flex" flexDirection="column">
            <Box marginBottom={3}>
              <Typography
                variant="h2"
                style={{ marginTop: '1rem', marginBottom: '1rem' }}
              >
                Client-wise summary
              </Typography>
              <Breadcrumbs aria-label="breadcrumb">
                <Button
                  variant="text"
                  onClick={() => {
                    setSelectedLoanOfficer(null)
                    setCurrentView('lo')
                  }}
                >
                  Loan officer summary
                </Button>
                <Button
                  variant="text"
                  onClick={() => {
                    setSelectedGroup(null)
                    setCurrentView('group')
                  }}
                >
                  {SelectedLoanOfficer.loanOfficerName}
                </Button>
                <Typography color="primary">
                  {SelectedGroup.clientGroupName}
                </Typography>
              </Breadcrumbs>
              <Table>
                <TableHead>
                  <TableRow className={classes.summary}>
                    <TableCell className={classes.thStringValue}>
                      Client name
                    </TableCell>
                    <TableCell className={classes.thNumericValue}>
                      Realizable
                    </TableCell>
                    <TableCell className={classes.thNumericValue}>
                      Realization
                    </TableCell>
                    <TableCell className={classes.thNumericValue}>
                      Advance
                    </TableCell>
                    <TableCell className={classes.thNumericValue}>
                      OD collection
                    </TableCell>
                    <TableCell className={classes.thNumericValue}>
                      New overdue
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clientSummaryData.map(row => (
                    <TableRow
                      key={row.clientId}
                      style={{ display: 'table-row' }}
                    >
                      <TableCell style={{ textAlign: 'left' }}>
                        {row.clientName}
                      </TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        {numeral(row.realizable).format('0,0')}
                      </TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        {numeral(row.realization).format('0,0')}
                      </TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        {numeral(row.advance).format('0,0')}
                      </TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        {numeral(row.odCollection).format('0,0')}
                      </TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        {numeral(row.newOverdue).format('0,0')}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow
                    className={classes.summary}
                    style={{ display: 'table-row' }}
                  >
                    <TableCell
                      style={{ textAlign: 'left', fontWeight: 'bold' }}
                    >
                      Total
                    </TableCell>
                    <TableCell
                      style={{ textAlign: 'right', fontWeight: 'bold' }}
                    >
                      {numeral(
                        clientSummaryData.reduce(
                          (acc, row) => acc + row.realizable,
                          0
                        )
                      ).format('0,0')}
                    </TableCell>
                    <TableCell
                      style={{ textAlign: 'right', fontWeight: 'bold' }}
                    >
                      {numeral(
                        clientSummaryData.reduce(
                          (acc, row) => acc + row.realization,
                          0
                        )
                      ).format('0,0')}
                    </TableCell>
                    <TableCell
                      style={{ textAlign: 'right', fontWeight: 'bold' }}
                    >
                      {numeral(
                        clientSummaryData.reduce(
                          (acc, row) => acc + row.advance,
                          0
                        )
                      ).format('0,0')}
                    </TableCell>
                    <TableCell
                      style={{ textAlign: 'right', fontWeight: 'bold' }}
                    >
                      {numeral(
                        clientSummaryData.reduce(
                          (acc, row) => acc + row.odCollection,
                          0
                        )
                      ).format('0,0')}
                    </TableCell>
                    <TableCell
                      style={{ textAlign: 'right', fontWeight: 'bold' }}
                    >
                      {numeral(
                        clientSummaryData.reduce(
                          (acc, row) => acc + row.newOverdue,
                          0
                        )
                      ).format('0,0')}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
            <BMCollectionsOverview
              data={bmCollectionsOverviewData}
              classes={classes}
            />
          </Box>
        </Box>
      )}
      {(isFetching || isFetchingBmCollectionsOverview) && (
        <Box
          display="flex"
          flex={1}
          justifyContent="center"
          alignItems="center"
        >
          <CircularProgress color="secondary" />
        </Box>
      )}
    </>
  )
}

const PReportsCollectionsOverview = () => {
  const classes = useStyles()

  const {
    selectedDate,
    branchId,
    date,
    minDate,
    handleBranchIdChange,
    handleDateChange,
    branches,
    isBranchesLoading,
  } = useReportLogic()

  const [SelectedLoanOfficer, setSelectedLoanOfficer] = useState(null)
  const [SelectedGroup, setSelectedGroup] = useState(null)
  const [currentView, setCurrentView] = useState('lo') // group, client

  return (
    <TReports active="/reports/collections-overview">
      <div className={classes.form}>
        <Box
          display="flex"
          alignItems="center"
          className={classes.bar}
          flexShrink={0}
          pl={1}
        >
          <Box paddingBottom={1} display="flex" alignItems="center">
            <KeyboardDatePicker
              allowKeyboardControl={false}
              disableToolbar
              // minDate={minDate}
              maxDate={moment().toDate()}
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
            {branches && branchId && !isBranchesLoading && (
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
        </Box>
        {currentView === 'lo' && (
          <LoanOfficerSummary
            branchId={branchId}
            date={date}
            setSelectedLoanOfficer={setSelectedLoanOfficer}
            classes={classes}
            setCurrentView={setCurrentView}
          />
        )}
        {currentView === 'group' && (
          <GroupSummary
            date={date}
            branchId={branchId}
            SelectedLoanOfficer={SelectedLoanOfficer}
            setSelectedLoanOfficer={setSelectedLoanOfficer}
            setCurrentView={setCurrentView}
            classes={classes}
            setSelectedGroup={setSelectedGroup}
          />
        )}
        {currentView === 'client' && (
          <ClientSummary
            date={date}
            branchId={branchId}
            SelectedLoanOfficer={SelectedLoanOfficer}
            SelectedGroup={SelectedGroup}
            setSelectedLoanOfficer={setSelectedLoanOfficer}
            setSelectedGroup={setSelectedGroup}
            setCurrentView={setCurrentView}
            classes={classes}
          />
        )}
      </div>
    </TReports>
  )
}

export default PReportsCollectionsOverview
