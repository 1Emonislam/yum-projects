import { timeFormat, timezone, useAuth, useSecureLoansByClientId } from 'shared'
import { Link } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import Box from '@material-ui/core/Box'
import capitalize from 'lodash/capitalize'
import CircularProgress from '@material-ui/core/CircularProgress'
import moment from 'moment-timezone'
import numeral from 'numeral'
import React, { useMemo } from 'react'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TClient from '../templates/TClient'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
  warning: {
    paddingLeft: 15,
    borderLeft: '2px solid',
    borderLeftColor: theme.palette.warning.main,
    '& svg': {
      marginLeft: -16,
    },
  },
}))

const PClientInstallments = () => {
  const { clientId } = useParams()

  const classes = useStyles()

  const { _id: userId, branchId, role } = useAuth()

  const { isFetching, data } = useSecureLoansByClientId({
    id: clientId,
    role,
    userId,
    branchId,
  })

  const installments = useMemo(() => {
    let installments = []

    if (data) {
      data.forEach(loan => {
        if (
          loan.status !== 'awaitingManagerReview' &&
          loan.status !== 'approvedByManager' &&
          loan.status !== 'rejectedByManager'
        ) {
          loan.installments.forEach((installment, i) => {
            installments.push({
              loanId: loan._id,
              loanCode: loan.code,
              loanCreatedAt: loan.createdAt,
              number: Number(i) + 1,
              ...installment,
            })
          })
        }
      })
    }

    installments.sort((a, b) => {
      if (a.loanCreatedAt === b.loanCreatedAt) {
        return moment(b.due) - moment(a.due)
      }

      return moment(b.loanCreatedAt) - moment(a.loanCreatedAt)
    })

    return installments
  }, [data])

  return (
    <TClient active="installments" clientId={clientId}>
      {isFetching && (
        <Box
          flexGrow={1}
          display="flex"
          width="100%"
          justifyContent="center"
          alignItems="center"
        >
          <CircularProgress color="secondary" />
        </Box>
      )}
      {!isFetching && (!installments || installments.length === 0) && (
        <Box
          flexGrow={1}
          display="flex"
          width="100%"
          justifyContent="center"
          alignItems="center"
        >
          <Typography variant="h2">No installments</Typography>
        </Box>
      )}
      {!isFetching && installments && installments.length > 0 && (
        <Box width="100%">
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell width="60"></TableCell>
                <TableCell width="60">Loan</TableCell>
                <TableCell width="60">Due</TableCell>
                <TableCell width="60">Status</TableCell>
                <TableCell align="right">Installment</TableCell>
                <TableCell align="right">Target</TableCell>
                <TableCell align="right">Opening balance</TableCell>
                <TableCell align="right">Realization</TableCell>
                {/* TODO: */}
                {/* <TableCell align="right">Missing installments</TableCell> */}
                {/* <TableCell align="right">Cumulative realization</TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody>
              {installments.map(installment => (
                <TableRow
                  key={`${installment.loanId}.${installment.number}`}
                  hover
                >
                  <TableCell
                    className={installment.wasLate ? classes.warning : ''}
                  >
                    {installment.number}.
                  </TableCell>
                  <TableCell>
                    <Link
                      to={`/clients/${clientId}/loans/${installment.loanId}`}
                    >
                      {installment.loanCode}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {moment(installment.due)
                      .tz(timezone)
                      .format(timeFormat.default)}
                  </TableCell>
                  <TableCell>{capitalize(installment.status)}</TableCell>
                  <TableCell align="right">
                    USh {numeral(installment.total).format('0,0')}
                  </TableCell>
                  <TableCell align="right">
                    {installment.target
                      ? `USh ${numeral(installment.target).format('0,0')}`
                      : '—'}
                  </TableCell>
                  <TableCell align="right">
                    {installment.openingBalance
                      ? `USh ${numeral(installment.openingBalance).format(
                          '0,0'
                        )}`
                      : '—'}
                  </TableCell>
                  <TableCell align="right">
                    {installment.realization
                      ? `USh ${numeral(installment.realization).format('0,0')}`
                      : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </TClient>
  )
}

export default PClientInstallments
