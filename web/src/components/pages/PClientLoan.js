import { Link, useParams } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import {
  required,
  timeFormat,
  timezone,
  useAmortization,
  useAuth,
  useSecureLoanById,
} from 'shared'
import { useHistory } from 'react-router-dom'
import { useQueryClient } from 'react-query'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import capitalize from 'lodash/capitalize'
import CircularProgress from '@material-ui/core/CircularProgress'
import EditIcon from '@material-ui/icons/Edit'
import LibraryAddCheckIcon from '@material-ui/icons/LibraryAddCheck'
import MLoanPhoto from '../molecules/MLoanPhoto'
import OCollectInstallmentsDialog from '../organisms/OCollectInstallmentsDialog'
import MLoanSignature from '../molecules/MLoanSignature'
import moment from 'moment-timezone'
import MTable from '../molecules/MTable'
import numeral from 'numeral'
import React, { Fragment, useMemo, useState } from 'react'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
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
  th: {
    fontSize: '13px',
    lineHeight: 1.5,
  },
}))

const PClientLoan = () => {
  const classes = useStyles()

  const queryClient = useQueryClient()

  const history = useHistory()

  const { clientId, loanId } = useParams()

  const [collectInstallmentsDialog, setCollectInstallmentsDialog] =
    useState(false)

  const { _id: userId, branchId, role } = useAuth()

  const {
    isLoading,
    isFetching,
    data: loan,
  } = useSecureLoanById({
    id: loanId,
    role,
    userId,
    branchId,
  })

  const { isFetching: isFetchingAmortization, data: amortization } =
    useAmortization({ loanId, role })

  const cashCollateral =
    (loan?.approvedAmount || loan?.requestedAmount) *
    (loan?.cashCollateral / 100)

  const loanInsurance =
    (loan?.approvedAmount || loan?.requestedAmount) *
    (loan?.loanInsurance / 100)

  const loanProcessing =
    loan?.loanProcessingFee?.type === 'fixed'
      ? loan?.loanProcessingFee?.value
      : (loan?.approvedAmount || loan?.requestedAmount) *
        (loan?.loanProcessingFee?.value / 100)

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
    <TClient active="loans" clientId={clientId}>
      {isFetching && (
        <Box
          width="100%"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <CircularProgress color="secondary" />
        </Box>
      )}
      {!isFetching && (
        <Box display="flex" flexDirection="column" width="100%">
          <Box
            display="flex"
            alignItems="center"
            pl={2}
            pr={1}
            className={classes.bar}
            height={53}
            flexShrink={0}
          >
            <Typography variant="h2">Loan {loan?.code}</Typography>
            <Box flexGrow={1} />
            {!isLoading &&
              ['branchManager', 'admin'].includes(role) &&
              loan?.status === 'active' && (
                <Box display="flex" p={1}>
                  <Button
                    startIcon={<LibraryAddCheckIcon />}
                    className={classes.action}
                    onClick={() => setCollectInstallmentsDialog(true)}
                  >
                    Collect installments
                  </Button>
                </Box>
              )}
            {!isLoading && role === 'admin' && (
              <Box display="flex" p={1}>
                <Button
                  startIcon={<EditIcon />}
                  className={classes.action}
                  component={Link}
                  to={`/admin/clients/${clientId}/loans/${loan?._id}/edit`}
                >
                  Edit loan
                </Button>
              </Box>
            )}
          </Box>
          <Box flexGrow={1} overflow="auto" bgcolor="grey.200" px={2} pb={8}>
            <MTable pt={2}>
              <TableBody>
                <TableRow hover>
                  <TableCell width="250">Status:</TableCell>
                  <TableCell>
                    {capitalize(loan?.status)
                      .replace(
                        'Awaitingmanagerreview',
                        'Awaiting manager review'
                      )
                      .replace('Approvedbymanager', 'Approved')
                      .replace('Rejectedbymanager', 'Rejected')
                      .replace('Notpaid', 'Not paid')}
                  </TableCell>
                </TableRow>
                <TableRow hover>
                  <TableCell>Edited:</TableCell>
                  <TableCell>{loan?.edited ? 'Yes' : 'No'}</TableCell>
                </TableRow>
                <TableRow hover>
                  <TableCell>Type:</TableCell>
                  <TableCell>{loan?.loanProductName}</TableCell>
                </TableRow>
                <TableRow hover>
                  <TableCell>Installment:</TableCell>
                  <TableCell>
                    USh {numeral(loan?.installments[0].total).format('0,0')}
                  </TableCell>
                </TableRow>
                <TableRow hover>
                  <TableCell>Approved amount:</TableCell>
                  <TableCell>
                    {loan?.approvedAmount
                      ? `USh ${numeral(loan.approvedAmount).format('0,0')}`
                      : '—'}
                  </TableCell>
                </TableRow>
                <TableRow hover>
                  <TableCell>Requested amount:</TableCell>
                  <TableCell>
                    USh {numeral(loan?.requestedAmount).format('0,0')}
                  </TableCell>
                </TableRow>
                <TableRow hover>
                  <TableCell>Interest rate:</TableCell>
                  <TableCell>{loan?.interestRate}%</TableCell>
                </TableRow>
                {loan?.approvedAmount && (
                  <TableRow hover>
                    <TableCell>Disbursed amount:</TableCell>
                    <TableCell>
                      USh{' '}
                      {numeral(
                        loan?.approvedAmount +
                          loan?.approvedAmount * (loan?.interestRate / 100)
                      ).format('0,0')}
                    </TableCell>
                  </TableRow>
                )}
                <TableRow hover>
                  <TableCell>Security &amp; savings:</TableCell>
                  <TableCell>
                    USh {numeral(cashCollateral).format('0,0')}
                  </TableCell>
                </TableRow>
                <TableRow hover>
                  <TableCell>Loan processing:</TableCell>
                  <TableCell>
                    USh {numeral(loanProcessing).format('0,0')}
                  </TableCell>
                </TableRow>
                <TableRow hover>
                  <TableCell>Insurance:</TableCell>
                  <TableCell>
                    USh {numeral(loanInsurance).format('0,0')}
                  </TableCell>
                </TableRow>
                <TableRow hover>
                  <TableCell>Cycle:</TableCell>
                  <TableCell>{loan?.cycle}</TableCell>
                </TableRow>
                <TableRow hover>
                  <TableCell>Duration:</TableCell>
                  <TableCell>{duration}</TableCell>
                </TableRow>
                <TableRow hover>
                  <TableCell>Group:</TableCell>
                  <TableCell>{loan?.clientGroupName}</TableCell>
                </TableRow>
                <TableRow hover>
                  <TableCell>Loan Officer:</TableCell>
                  <TableCell>{loan?.loanOfficerName}</TableCell>
                </TableRow>
                {loan?.branchManagerName && (
                  <TableRow hover>
                    <TableCell>Branch Manager:</TableCell>
                    <TableCell>{loan?.branchManagerName}</TableCell>
                  </TableRow>
                )}
                {loan?.disbursementAt && (
                  <TableRow hover>
                    <TableCell>Disbursement:</TableCell>
                    <TableCell>
                      {moment(loan.disbursementAt)
                        .tz(timezone)
                        .format(timeFormat.full)}
                    </TableCell>
                  </TableRow>
                )}
                {loan?.disbursementPhoto && (
                  <MLoanPhoto
                    photo={loan.disbursementPhoto}
                    label="Disbursement photo"
                  />
                )}
              </TableBody>
            </MTable>
            <MTable title="Schedule">
              <TableHead>
                <TableRow>
                  <TableCell width="20">&nbsp;</TableCell>
                  <TableCell>Due date</TableCell>
                  <TableCell align="right">Principal</TableCell>
                  <TableCell align="right">Interest</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="right">Target</TableCell>
                  <TableCell align="right">Realization</TableCell>
                  <TableCell align="right">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loan?.installments.map((installment, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{Number(index) + 1}.</TableCell>
                    <TableCell>
                      {moment(installment.due)
                        .tz(timezone)
                        .format(timeFormat.default)}
                    </TableCell>
                    <TableCell align="right">
                      USh{' '}
                      {numeral(installment.principalRepayment).format('0,0')}
                    </TableCell>
                    <TableCell align="right">
                      USh {numeral(installment.interest).format('0,0')}
                    </TableCell>
                    <TableCell align="right">
                      USh {numeral(installment.total).format('0,0')}
                    </TableCell>
                    <TableCell align="right">
                      {installment.target
                        ? `USh ${numeral(installment.target).format('0,0')}`
                        : '—'}
                    </TableCell>
                    <TableCell align="right">
                      {installment.realization
                        ? `USh ${numeral(installment.realization).format(
                            '0,0'
                          )}`
                        : '—'}
                    </TableCell>
                    <TableCell align="right">
                      {capitalize(installment.status)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </MTable>
            {role === 'admin' && loan?.approvedAmount && (
              <Fragment>
                {isFetchingAmortization && (
                  <Box pt={4} pb={1}>
                    <Typography variant="h3">
                      Schedule with amortization
                    </Typography>
                    <Box pt={2}>
                      <CircularProgress color="secondary" size={24} />
                    </Box>
                  </Box>
                )}
                {!isFetchingAmortization && (
                  <MTable title="Schedule with amortization">
                    <TableHead>
                      <TableRow>
                        <TableCell className={classes.th} width="10">
                          &nbsp;
                        </TableCell>
                        <TableCell className={classes.th}>Due date</TableCell>
                        <TableCell className={classes.th} align="right">
                          Principal
                        </TableCell>
                        <TableCell className={classes.th} align="right">
                          Principal outstanding
                        </TableCell>
                        <TableCell className={classes.th} align="right">
                          Interest
                        </TableCell>
                        <TableCell className={classes.th} align="right">
                          Interest receivable
                        </TableCell>
                        <TableCell className={classes.th} align="right">
                          Target
                        </TableCell>
                        <TableCell className={classes.th} align="right">
                          Realization
                        </TableCell>
                        <TableCell className={classes.th}>Status</TableCell>
                        <TableCell className={classes.th} align="right">
                          Unearned interest
                        </TableCell>
                        <TableCell className={classes.th} align="right">
                          Monthly accrued interest realization
                        </TableCell>
                        <TableCell className={classes.th} align="right">
                          Monthly accrued insurance
                        </TableCell>
                        <TableCell className={classes.th} align="right">
                          Insurance liability
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {amortization?.installments.map((installment, index) => (
                        <TableRow key={index} hover>
                          <TableCell>{Number(index) + 1}.</TableCell>
                          <TableCell>
                            {moment(installment.due)
                              .tz(timezone)
                              .format(timeFormat.default)}
                          </TableCell>
                          <TableCell align="right">
                            {numeral(installment.principalRepayment).format(
                              '0,0'
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {numeral(
                              installment.principalOutstandingClosingBalance
                            ).format('0,0')}
                          </TableCell>
                          <TableCell align="right">
                            {numeral(installment.interest).format('0,0')}
                          </TableCell>
                          <TableCell align="right">
                            {numeral(installment.interestReceivable).format(
                              '0,0'
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {installment.target
                              ? `${numeral(installment.target).format('0,0')}`
                              : '—'}
                          </TableCell>
                          <TableCell align="right">
                            {installment.realization
                              ? `${numeral(installment.realization).format(
                                  '0,0'
                                )}`
                              : '—'}
                          </TableCell>
                          <TableCell>
                            {capitalize(installment.status)}
                          </TableCell>
                          <TableCell align="right">
                            {installment.interestUnearned
                              ? `${numeral(installment.interestUnearned).format(
                                  '0,0'
                                )}`
                              : '—'}
                          </TableCell>
                          <TableCell align="right">
                            {installment.monthlyAccruedInterestRealization
                              ? `${numeral(
                                  installment.monthlyAccruedInterestRealization
                                ).format('0,0')}`
                              : '—'}
                          </TableCell>
                          <TableCell align="right">
                            {installment.monthlyAccruedInsurance
                              ? `${numeral(
                                  installment.monthlyAccruedInsurance
                                ).format('0,0')}`
                              : '—'}
                          </TableCell>
                          <TableCell align="right">
                            {numeral(installment.insuranceLiability).format(
                              '0,0'
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </MTable>
                )}
              </Fragment>
            )}
            {(loan?.forms?.application || loan?.forms?.inspection) && (
              <MTable
                title="Forms"
                component="div"
                style={{ display: 'table' }}
              >
                <TableHead
                  component="div"
                  style={{ display: 'table-header-group' }}
                >
                  <TableRow component="div" style={{ display: 'table-row' }}>
                    <TableCell
                      component="div"
                      style={{ display: 'table-cell' }}
                    >
                      Code
                    </TableCell>
                    <TableCell
                      component="div"
                      style={{ display: 'table-cell' }}
                    >
                      Type
                    </TableCell>
                    <TableCell
                      component="div"
                      style={{ display: 'table-cell' }}
                    >
                      Status
                    </TableCell>
                    <TableCell
                      component="div"
                      style={{ display: 'table-cell' }}
                    >
                      Employee
                    </TableCell>
                    <TableCell
                      component="div"
                      style={{ display: 'table-cell' }}
                      align="right"
                    >
                      Submitted
                    </TableCell>
                    <TableCell
                      component="div"
                      style={{ display: 'table-cell' }}
                      align="right"
                    >
                      Last update
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody
                  component="div"
                  style={{ display: 'table-row-group' }}
                >
                  {loan?.forms?.inspection && (
                    <TableRow
                      hover
                      component={Link}
                      to={`/clients/${clientId}/forms/${loan?.forms?.inspection._id}`}
                      style={{ display: 'table-row' }}
                    >
                      <TableCell
                        component="div"
                        style={{ display: 'table-cell' }}
                      >
                        {loan?.forms?.inspection.code}
                      </TableCell>
                      <TableCell
                        component="div"
                        style={{ display: 'table-cell' }}
                      >
                        Client inspection
                      </TableCell>
                      <TableCell
                        component="div"
                        style={{ display: 'table-cell' }}
                      >
                        {capitalize(loan?.forms?.inspection.status)}
                      </TableCell>
                      <TableCell
                        component="div"
                        style={{ display: 'table-cell' }}
                      >
                        {loan?.forms?.inspection.user.lastName},{' '}
                        {loan?.forms?.inspection.user.firstName}
                      </TableCell>
                      <TableCell
                        component="div"
                        style={{ display: 'table-cell' }}
                        align="right"
                      >
                        {moment(loan?.forms?.inspection.createdAt)
                          .tz(timezone)
                          .format(timeFormat.default)}
                      </TableCell>
                      <TableCell
                        component="div"
                        style={{ display: 'table-cell' }}
                        align="right"
                      >
                        {moment(loan?.forms?.inspection.updatedAt)
                          .tz(timezone)
                          .format(timeFormat.default)}
                      </TableCell>
                    </TableRow>
                  )}
                  {loan?.forms?.application && (
                    <TableRow
                      hover
                      component={Link}
                      to={`/clients/${clientId}/forms/${loan?.forms?.application._id}`}
                      style={{ display: 'table-row' }}
                    >
                      <TableCell
                        component="div"
                        style={{ display: 'table-cell' }}
                      >
                        {loan?.forms?.application.code}
                      </TableCell>
                      <TableCell
                        component="div"
                        style={{ display: 'table-cell' }}
                      >
                        Loan application
                      </TableCell>
                      <TableCell
                        component="div"
                        style={{ display: 'table-cell' }}
                      >
                        {capitalize(loan?.forms?.application.status)}
                      </TableCell>
                      <TableCell
                        component="div"
                        style={{ display: 'table-cell' }}
                      >
                        {loan?.forms?.application.user.lastName},{' '}
                        {loan?.forms?.application.user.firstName}
                      </TableCell>
                      <TableCell
                        component="div"
                        style={{ display: 'table-cell' }}
                        align="right"
                      >
                        {moment(loan?.forms?.application.createdAt)
                          .tz(timezone)
                          .format(timeFormat.default)}
                      </TableCell>
                      <TableCell
                        component="div"
                        style={{ display: 'table-cell' }}
                        align="right"
                      >
                        {moment(loan?.forms?.application.updatedAt)
                          .tz(timezone)
                          .format(timeFormat.default)}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </MTable>
            )}
            {(loan?.status === 'active' ||
              loan?.status === 'notpaid' ||
              loan?.status === 'nibl' ||
              loan?.status === 'repaid') &&
              loan?.signatures?.client && (
                <MTable title="Signatures">
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <strong>Client</strong>
                      </TableCell>
                    </TableRow>
                    <MLoanSignature
                      signature={loan?.signatures?.client}
                      label={`${loan?.client?.lastName}, ${loan?.client?.firstName}`}
                      context={`Signature: Client: ${loan?.client?.lastName}, ${loan?.client?.firstName}`}
                      labelAsLink
                    />
                    <TableRow>
                      <TableCell>
                        <strong>Loan Officer</strong>
                      </TableCell>
                    </TableRow>
                    <MLoanSignature
                      signature={loan?.signatures?.loanOfficer}
                      label={loan?.loanOfficerName}
                      context={`Signature: Loan Officer: ${loan?.loanOfficerName}`}
                      labelAsLink
                    />
                    <TableRow>
                      <TableCell>
                        <strong>Branch Manager</strong>
                      </TableCell>
                    </TableRow>
                    <MLoanSignature
                      signature={loan?.signatures?.branchManager}
                      label={loan?.branchManagerName}
                      context={`Signature: Branch Manager: ${loan?.branchManagerName}`}
                      labelAsLink
                    />
                    <TableRow>
                      <TableCell>
                        <strong>Disbursement witnesses</strong>
                      </TableCell>
                    </TableRow>
                    <MLoanSignature
                      signature={loan?.signatures?.witnesses[0].signature}
                      label={loan?.signatures?.witnesses[0].name}
                      context={`Signature: Witness #1: ${loan?.signatures?.witnesses[0].name}`}
                      labelAsLink
                    />
                    <MLoanSignature
                      signature={loan?.signatures?.witnesses[1].signature}
                      label={loan?.signatures?.witnesses[1].name}
                      context={`Signature: Witness #2: ${loan?.signatures?.witnesses[1].name}`}
                      labelAsLink
                    />
                    <MLoanSignature
                      signature={loan?.signatures?.witnesses[2].signature}
                      label={loan?.signatures?.witnesses[2].name}
                      context={`Signature: Witness #3: ${loan?.signatures?.witnesses[2].name}`}
                      labelAsLink
                    />
                  </TableBody>
                </MTable>
              )}
          </Box>
        </Box>
      )}
      <OCollectInstallmentsDialog
        loan={loan}
        onClose={() => setCollectInstallmentsDialog(false)}
        open={collectInstallmentsDialog}
      />
    </TClient>
  )
}

export default PClientLoan
