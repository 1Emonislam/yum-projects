import { makeStyles } from '@material-ui/core/styles'
import {
  timezone,
  useAuth,
  useSecureFormById,
  useSecureLoansByClientId,
  useInsertEvent,
} from 'shared'
import { Link, useParams } from 'react-router-dom'
import { useQueryClient } from 'react-query'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import CancelIcon from '@material-ui/icons/Cancel'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import CircularProgress from '@material-ui/core/CircularProgress'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import MLoanAddress from '../molecules/MLoanAddress'
import MLoanForecast from '../molecules/MLoanForecast'
import MLoanGuarantor from '../molecules/MLoanGuarantor'
import MLoanPhoto from '../molecules/MLoanPhoto'
import MLoanSignature from '../molecules/MLoanSignature'
import MLoanUtilization from '../molecules/MLoanUtilization'
import moment from 'moment-timezone'
import MTable from '../molecules/MTable'
import React, { Fragment, useMemo, useState } from 'react'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import TClient from '../templates/TClient'
import TextField from '@material-ui/core/TextField'
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
    height: 52,
    flexShrink: 0,
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
}))

const PClientForm = () => {
  const classes = useStyles()

  const { clientId, formId } = useParams()

  const queryClient = useQueryClient()

  const { _id: userId, branchId, role, isAdmin, isBranchManager } = useAuth()

  const {
    isLoading,
    isFetching,
    data: form,
  } = useSecureFormById({
    id: formId,
    role,
    userId,
    branchId,
  })

  const { data: loans } = useSecureLoansByClientId({
    id: clientId,
    role,
    userId,
    branchId,
  })

  const {
    mutate,
    isLoading: isLoadingMutation,
    isError: isMutationError,
    isSuccess: isMutationSuccess,
  } = useInsertEvent()

  const [dialog, setDialog] = useState(false)
  const [action, setAction] = useState('Reject')
  const [notes, setNotes] = useState('')

  const decide = () => {
    const formType = form?.type || form?.formType

    const isLoanApplicationForm = formType === 'application'

    const hasOtherActiveLoans = loans
      ? loans.some(
          loan =>
            String(loan._id) !== String(form.loan._id) &&
            loan.status === 'active'
        )
      : false

    mutate(
      {
        type: 'update',
        obj: 'form',
        _id: form?._id,
        status: action === 'Reject' ? 'rejected' : 'approved',
        notes,
      },
      {
        onSuccess: () => {
          mutate(
            {
              type: 'update',
              obj: 'client',
              _id: clientId,
              status:
                action === 'Reject'
                  ? hasOtherActiveLoans
                    ? 'active'
                    : 'toSurvey'
                  : hasOtherActiveLoans
                  ? 'active'
                  : 'surveyed',
            },
            {
              onSuccess: () => {
                queryClient.invalidateQueries('clientById')

                mutate(
                  {
                    type: 'update',
                    obj: 'loan',
                    _id: form.loan._id,
                    approvedAmount:
                      action === 'Approve' && !isLoanApplicationForm
                        ? form.content.loan.amount
                        : null,
                    status:
                      action === 'Reject'
                        ? 'rejectedByManager'
                        : isLoanApplicationForm
                        ? 'awaitingManagerReview'
                        : 'approvedByManager',
                  },
                  {
                    onSuccess: () => {
                      queryClient.invalidateQueries('formById')
                    },
                  }
                )
              },
            }
          )
        },
      }
    )

    setDialog(false)
  }

  const duration = useMemo(() => {
    if (form) {
      const value = form.content.loan.duration.value

      switch (form.content.loan.duration.unit) {
        case 'week':
          return `${value} weeks`
        case 'twoWeeks':
          return `${value * 2} weeks`
        case 'month':
          return `${value} months`
      }
    }

    return ''
  }, [form])

  return (
    <TClient active="forms" clientId={clientId}>
      <Box display="flex" flexDirection="column" width="100%">
        <Box
          display="flex"
          alignItems="center"
          pl={2}
          pr={1}
          className={classes.bar}
        >
          <Typography variant="h2">
            {form
              ? form?.type === 'application' || form?.formType === 'application'
                ? 'Loan application'
                : 'Client inspection'
              : ' '}{' '}
            {form?.code}
          </Typography>
          <Box flexGrow={1} />
          {!isLoading &&
            (isBranchManager || isAdmin) &&
            form?.status !== 'approved' &&
            form?.status !== 'rejected' &&
            form?.loan?.status !== 'active' && (
              <Box display="flex" p={1}>
                <Button
                  startIcon={<CheckCircleIcon />}
                  className={classes.action}
                  onClick={() => {
                    setDialog(true)
                    setAction('Approve')
                  }}
                >
                  Approve
                </Button>
                <Button
                  startIcon={<CancelIcon />}
                  className={classes.action}
                  onClick={() => {
                    setDialog(true)
                    setAction('Reject')
                  }}
                >
                  Reject
                </Button>
              </Box>
            )}
        </Box>
        <Dialog open={dialog} onClose={() => setDialog(false)}>
          <DialogTitle id="form-dialog-title">
            {action} the loan application
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Optional notes"
              fullWidth
              multiline
              value={notes}
              onChange={event => setNotes(event.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialog(false)} color="primary">
              Cancel
            </Button>
            <Button onClick={decide} color="primary">
              {action}
            </Button>
          </DialogActions>
        </Dialog>
        <Box
          flexGrow={1}
          overflow="auto"
          bgcolor="grey.200"
          position="relative"
          px={2}
          pb={8}
        >
          {(isFetching || isLoadingMutation) && (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            >
              <CircularProgress color="secondary" />
            </Box>
          )}
          {!isFetching && !isLoadingMutation && (
            <Fragment>
              <MTable pt={2}>
                <TableBody>
                  <TableRow hover>
                    <TableCell width="250">Status:</TableCell>
                    <TableCell style={{ textTransform: 'capitalize' }}>
                      {form?.status}
                    </TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell>Code:</TableCell>
                    <TableCell>{form?.code}</TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell>Loan:</TableCell>
                    <TableCell>
                      <Link
                        to={`/clients/${clientId}/loans/${form?.loan?._id}`}
                      >
                        {form?.loan?.code}
                      </Link>
                    </TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell>Submitted:</TableCell>
                    <TableCell>
                      {form
                        ? moment(form.createdAt)
                            .tz(timezone)
                            .format('D MMMM YYYY, H:mm')
                        : ''}
                    </TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell>Employee:</TableCell>
                    <TableCell>
                      {form?.user?.lastName}, {form?.user?.firstName}
                    </TableCell>
                  </TableRow>
                  {form?.type === 'application' && (
                    <TableRow hover>
                      <TableCell>Last update:</TableCell>
                      <TableCell>
                        {form
                          ? moment(form.updatedAt)
                              .tz(timezone)
                              .format('D MMMM YYYY, H:mm')
                          : ''}
                      </TableCell>
                    </TableRow>
                  )}
                  {form?.locations?.submission?.lat && (
                    <TableRow hover>
                      <TableCell>Location:</TableCell>
                      <TableCell>
                        {form ? (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${form.locations.submission.lat},${form.locations.submission.lng}`}
                            target="_blank"
                            rel="noreferrer nofollow"
                          >
                            Show on map
                          </a>
                        ) : (
                          ''
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                  <TableRow hover>
                    <TableCell>Notes:</TableCell>
                    <TableCell>{form?.notes || '—'}</TableCell>
                  </TableRow>
                </TableBody>
              </MTable>
              {form?.type === 'inspection' && (
                <MTable title="Inspection">
                  <TableBody>
                    <MLoanPhoto
                      photo={form?.content.inspection[0]}
                      label="Photo #1"
                      context="Inspection photo #1"
                    />
                    <MLoanPhoto
                      photo={form?.content.inspection[1]}
                      label="Photo #2"
                      context="Inspection photo #2"
                    />
                    <MLoanPhoto
                      photo={form?.content.inspection[2]}
                      label="Photo #3"
                      context="Inspection photo #3"
                    />
                  </TableBody>
                </MTable>
              )}
              <MTable title="Loan">
                <TableBody>
                  <TableRow hover>
                    <TableCell width="250">Type:</TableCell>
                    <TableCell>{form?.content.loan.name}</TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell>Duration:</TableCell>
                    <TableCell>{duration}</TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell>Cycle:</TableCell>
                    <TableCell>{form?.content.loan.cycle}</TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell>Interest rate:</TableCell>
                    <TableCell>
                      {form ? `${form?.content.loan.interestRate}%` : ''}
                    </TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell>Amount:</TableCell>
                    <TableCell>
                      {form
                        ? new Intl.NumberFormat('en-Ug', {
                            style: 'currency',
                            currency: 'UGX',
                          }).format(form.content.loan.amount)
                        : ''}
                    </TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell>Amount to repay:</TableCell>
                    <TableCell>
                      {form
                        ? new Intl.NumberFormat('en-Ug', {
                            style: 'currency',
                            currency: 'UGX',
                          }).format(
                            form.content.loan.amount +
                              form.content.loan.amount *
                                (form.content.loan.interestRate / 100)
                          )
                        : ''}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </MTable>
              <MTable title="Basic information">
                <TableBody>
                  <TableRow hover>
                    <TableCell width="250">Occupation:</TableCell>
                    <TableCell>{form?.content.occupation}</TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell>Death of birth:</TableCell>
                    <TableCell>
                      {form
                        ? moment(form.content.dateOfBirth).format('DD/MM/YYYY')
                        : ''}
                    </TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell>Sex:</TableCell>
                    <TableCell style={{ textTransform: 'capitalize' }}>
                      {form?.content.sex}
                    </TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell>Name of father or husband:</TableCell>
                    <TableCell>{form?.content.fatherOrHusbandName}</TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell>Mobile phone number:</TableCell>
                    <TableCell>
                      {form?.content.mobilePhoneNumber || '—'}
                    </TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell>National ID or Voter ID number:</TableCell>
                    <TableCell>{form?.content.nationalVoterIdNumber}</TableCell>
                  </TableRow>
                  <MLoanPhoto
                    photo={form?.content.nationalVoterIdPhoto}
                    label="National ID or Voter ID photo"
                  />
                  <MLoanPhoto
                    photo={form?.content.photo}
                    label="Photo of the client"
                  />
                  {form?.content.loanRequirements &&
                    form?.content.loanRequirements.map(item => (
                      <MLoanPhoto
                        key={item.requirement}
                        photo={item}
                        label={item.name}
                      />
                    ))}
                </TableBody>
              </MTable>
              <MLoanAddress
                address={form?.content.residence}
                label="Residence"
              />
              <MLoanAddress address={form?.content.work} label="Work" />
              <MTable title="Previous loan">
                <TableBody>
                  <TableRow hover>
                    <TableCell width="250">Amount:</TableCell>
                    <TableCell>
                      {form?.content?.previousLoan?.amount
                        ? new Intl.NumberFormat('en-Ug', {
                            style: 'currency',
                            currency: 'UGX',
                          }).format(form.content.previousLoan.amount)
                        : '—'}
                    </TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell>Cycle:</TableCell>
                    <TableCell>
                      {form?.content?.previousLoan?.cycle || '—'}
                    </TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell>Purpose:</TableCell>
                    <TableCell>
                      {form?.content?.previousLoan?.purpose || '—'}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </MTable>
              <MTable title="Projects">
                <TableBody>
                  <TableRow hover>
                    <TableCell width="250">#1:</TableCell>
                    <TableCell>{form?.content.projects[0]}</TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell>#2:</TableCell>
                    <TableCell>{form?.content.projects[1]}</TableCell>
                  </TableRow>
                </TableBody>
              </MTable>
              <MTable title="Guarantors">
                <TableBody>
                  {form?.content.guarantors.map((guarantor, index) => (
                    <MLoanGuarantor
                      key={index}
                      guarantor={guarantor}
                      index={index}
                    />
                  ))}
                </TableBody>
              </MTable>
              <MTable title="Signatures">
                <TableBody>
                  <MLoanSignature
                    signature={form?.signatures.client}
                    label="Client"
                  />
                  <MLoanSignature
                    signature={form?.signatures.employee}
                    label={
                      form?.type === 'application' ||
                      form?.formType === 'application'
                        ? 'Loan Officer'
                        : 'Branch Manager'
                    }
                  />
                </TableBody>
              </MTable>
            </Fragment>
          )}
        </Box>
      </Box>
    </TClient>
  )
}

export default PClientForm
