import { KeyboardDatePicker } from '@material-ui/pickers'
import { makeStyles } from '@material-ui/core/styles'
import {
  timeFormat,
  useSecureBranches,
  useUserProfile,
  useBranchOverview,
  timezone,
} from 'shared'
import { useQueryString } from 'use-route-as-state'
import { useHistory } from 'react-router-dom'
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
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'
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
  tableHead: {
    '& td': {
      color: '#767676',
    },
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

function ClientsList({ data, classes, renderingPassbooks }) {
  const history = useHistory()
  return (
    <Box
      flexGrow={1}
      width="100%"
      overflow="auto"
      display="flex"
      justifyContent="center"
    >
      <Box
        display="flex"
        justifyContent="flex-start"
        style={{ paddingTop: 10, width: '100%' }}
      >
        <>
          {data.length === 0 && (
            <Box
              display="flex"
              justifyContent="center"
              style={{ padding: 50, width: '100%' }}
            >
              <Typography variant="caption">No clients found</Typography>
            </Box>
          )}
          {data?.length > 0 && (
            <Box style={{ width: '800px' }}>
              <Table>
                <TableHead>
                  <TableRow className={classes.summary}>
                    <TableCell className={classes.thStringValue}>
                      Code
                    </TableCell>
                    <TableCell className={classes.thStringValue}>
                      Name
                    </TableCell>
                    <TableCell className={classes.thStringValue}>
                      Branch
                    </TableCell>
                    <TableCell className={classes.thStringValue}>
                      Group name
                    </TableCell>
                    <TableCell className={classes.thStringValue}>
                      {renderingPassbooks ? 'Issue date' : 'Admission date'}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map(row => (
                    <TableRow
                      className={classes.tr}
                      key={row._id}
                      style={{ display: 'table-row' }}
                      hover
                      onClick={() => {
                        history.push(`/clients/${row._id}`)
                      }}
                    >
                      <TableCell>{row.code}</TableCell>
                      <TableCell>
                        {row.lastName}, {row.firstName}
                      </TableCell>
                      <TableCell>{row?.clientGroup?.branch?.name}</TableCell>
                      <TableCell>{row?.clientGroup?.name}</TableCell>
                      <TableCell>
                        {row.updatedAt
                          ? moment(row.updatedAt)
                              .tz(timezone)
                              .format(timeFormat.default)
                          : ''}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </>
      </Box>
    </Box>
  )
}

function SecurityDeposits({ data, classes }) {
  const history = useHistory()
  return (
    <Box
      flexGrow={1}
      width="100%"
      overflow="auto"
      display="flex"
      justifyContent="center"
    >
      <Box
        display="flex"
        justifyContent="flex-start"
        style={{ paddingTop: 10, width: '100%' }}
      >
        <>
          {data.length === 0 && (
            <Box
              display="flex"
              justifyContent="center"
              style={{ padding: 50, width: '100%' }}
            >
              <Typography variant="caption">No clients found</Typography>
            </Box>
          )}
          {data?.length > 0 && (
            <Box style={{ width: '800px' }}>
              <Table>
                <TableHead>
                  <TableRow className={classes.summary}>
                    <TableCell className={classes.thStringValue}>
                      Code
                    </TableCell>
                    <TableCell className={classes.thStringValue}>
                      Name
                    </TableCell>
                    <TableCell className={classes.thStringValue}>
                      Branch
                    </TableCell>
                    <TableCell className={classes.thStringValue}>
                      Group name
                    </TableCell>
                    <TableCell className={classes.thNumericValue}>
                      Security deposit
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map(item => {
                    const { client: row, change } = item
                    return (
                      <TableRow
                        className={classes.tr}
                        key={row._id}
                        style={{ display: 'table-row' }}
                        hover
                        onClick={() => {
                          history.push(`/clients/${row._id}`)
                        }}
                      >
                        <TableCell>{row.code}</TableCell>
                        <TableCell>
                          {row.lastName}, {row.firstName}
                        </TableCell>
                        <TableCell>{row?.clientGroup?.branch?.name}</TableCell>
                        <TableCell>{row?.clientGroup?.name}</TableCell>
                        <TableCell style={{ textAlign: 'right' }}>
                          {numeral(change).format('0,0')}
                        </TableCell>
                      </TableRow>
                    )
                  })}

                  <TableRow
                    className={classes.tr}
                    style={{ display: 'table-row' }}
                    hover
                  >
                    <TableCell>Total</TableCell>
                    <TableCell />
                    <TableCell />
                    <TableCell />
                    <TableCell style={{ textAlign: 'right' }}>
                      {numeral(
                        data.reduce((acc, val) => acc + val.change, 0)
                      ).format('0,0')}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          )}
        </>
      </Box>
    </Box>
  )
}

function LoansList({ data, classes }) {
  const history = useHistory()
  return (
    <Box
      flexGrow={1}
      width="100%"
      overflow="auto"
      display="flex"
      justifyContent="center"
    >
      <Box
        display="flex"
        justifyContent="flex-start"
        style={{ paddingTop: 10, width: '100%' }}
      >
        <>
          {data.length === 0 && (
            <Box
              display="flex"
              justifyContent="center"
              style={{ padding: 50, width: '100%' }}
            >
              <Typography variant="caption">No loans found</Typography>
            </Box>
          )}
          {data?.length > 0 && (
            <Box>
              <Table>
                <TableHead>
                  <TableRow className={classes.summary}>
                    <TableCell className={classes.thStringValue}>
                      Code
                    </TableCell>
                    <TableCell className={classes.thStringValue}>
                      Client
                    </TableCell>
                    <TableCell className={classes.thStringValue}>
                      Cycle
                    </TableCell>
                    <TableCell className={classes.thStringValue}>
                      Branch
                    </TableCell>
                    <TableCell className={classes.thStringValue}>
                      Group name
                    </TableCell>
                    <TableCell className={classes.thStringValue}>
                      Loan Officer
                    </TableCell>
                    <TableCell className={classes.thStringValue}>
                      Duration
                    </TableCell>
                    <TableCell className={classes.thStringValue}>
                      Amount
                    </TableCell>
                    <TableCell className={classes.thStringValue}>
                      Last updated at
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map(row => (
                    <TableRow
                      className={classes.tr}
                      key={row._id}
                      style={{ display: 'table-row' }}
                      hover
                      onClick={() => {
                        history.push(
                          `/clients/${row?.client?._id}/loans/${row?._id}`
                        )
                      }}
                    >
                      <TableCell>{row.code}</TableCell>
                      <TableCell>
                        {row?.client?.lastName}, {row?.client?.firstName}
                      </TableCell>
                      <TableCell>{row.cycle}</TableCell>
                      <TableCell>{row.branchName}</TableCell>
                      <TableCell>{row?.clientGroupName}</TableCell>
                      <TableCell>{row.loanOfficerName}</TableCell>
                      <TableCell>
                        {`${row?.duration?.value} ${row.duration?.unit}s`}
                      </TableCell>
                      <TableCell>
                        {numeral(row.approvedAmount).format('0,0')}
                      </TableCell>
                      <TableCell>
                        {row.updatedAt
                          ? moment(row.updatedAt)
                              .tz(timezone)
                              .format(timeFormat.default)
                          : ''}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className={classes.summary}>
                    <TableCell className={classes.thStringValue}>
                      Total
                    </TableCell>
                    <TableCell className={classes.thStringValue} />
                    <TableCell className={classes.thStringValue} />
                    <TableCell className={classes.thStringValue} />
                    <TableCell className={classes.thStringValue} />
                    <TableCell className={classes.thStringValue} />
                    <TableCell className={classes.thStringValue} />
                    <TableCell className={classes.thStringValue}>
                      {numeral(
                        data.reduce((acc, cur) => acc + cur.approvedAmount, 0)
                      ).format('0,0')}
                    </TableCell>
                    <TableCell className={classes.thStringValue} />
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          )}
        </>
      </Box>
    </Box>
  )
}

function StatCard({ title, value, onTabClicked, isActive, ...props }) {
  return (
    <Card
      style={{
        minWidth: 175,
        marginRight: '0.5rem',
        backgroundColor: isActive ? 'rgba(40, 183, 149, 0.2)' : '',
      }}
    >
      <CardContent>
        <Typography style={{ fontSize: 14 }} color="primary">
          {title}
        </Typography>
        <Typography variant="h5" component="div" color="secondary">
          {numeral(value).format('0,0')}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={onTabClicked}>
          More details
        </Button>
      </CardActions>
    </Card>
  )
}

function BranchOverviewStats({ branchId, date, classes }) {
  const [activeTab, setActiveTab] = useState('admissions')
  const { data: branchOverview = [], isFetching } = useBranchOverview({
    branchId,
    date,
  })

  const {
    newAdmissions,
    clientsWithPassbooksIssuedOrRenewed,
    newLoanApplications,
    disbursements,
    securityBalances,
  } = branchOverview

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
          <Box style={{ display: 'flex', flexDirection: 'column' }}>
            <Typography
              variant="h2"
              style={{ marginTop: '1rem', marginBottom: '1rem' }}
            >
              Branch Overview
            </Typography>
            <Box display="flex" justifyContent="center">
              <StatCard
                title="New admissions"
                value={newAdmissions?.length || 0}
                onTabClicked={() => setActiveTab('admissions')}
                isActive={activeTab === 'admissions'}
              />
              <StatCard
                title="Passbooks Issued"
                value={clientsWithPassbooksIssuedOrRenewed?.length || 0}
                onTabClicked={() => setActiveTab('passbooks')}
                isActive={activeTab === 'passbooks'}
              />
              <StatCard
                title="New loan applications"
                value={newLoanApplications?.length || 0}
                onTabClicked={() => setActiveTab('loans')}
                isActive={activeTab === 'loans'}
              />
              <StatCard
                title="Clients with security deposits"
                value={securityBalances?.length || 0}
                onTabClicked={() => setActiveTab('securityDeposits')}
                isActive={activeTab === 'securityDeposits'}
              />
              <StatCard
                title="Disbursements"
                value={disbursements?.length || 0}
                onTabClicked={() => setActiveTab('disbursements')}
                isActive={activeTab === 'disbursements'}
              />
            </Box>
            {activeTab === 'admissions' && (
              <ClientsList renderingPassbooks={false} data={newAdmissions || []} classes={classes} />
            )}
            {activeTab === 'passbooks' && (
              <ClientsList renderingPassbooks={true} data={clientsWithPassbooksIssuedOrRenewed || []} classes={classes} />
            )}
            {activeTab === 'loans' && (
              <LoansList data={newLoanApplications || []} classes={classes} />
            )}
            {activeTab === 'securityDeposits' && (
              <SecurityDeposits
                data={securityBalances || []}
                classes={classes}
              />
            )}
            {activeTab === 'disbursements' && (
              <LoansList data={disbursements || []} classes={classes} />
            )}
          </Box>
        </Box>
      )}
      {isFetching && (
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

const PReportsBranchOverview = () => {
  const classes = useStyles()

  const {
    selectedDate,
    branchId,
    date,
    handleBranchIdChange,
    handleDateChange,
    branches,
    isBranchesLoading,
  } = useReportLogic()

  return (
    <TReports active="/reports/branch-overview">
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
        <BranchOverviewStats
          branchId={branchId}
          date={date}
          classes={classes}
        />
      </div>
    </TReports>
  )
}

export default PReportsBranchOverview
