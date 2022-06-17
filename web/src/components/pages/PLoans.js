import { timeFormat, timezone, useAuth, useSecureLoans } from 'shared'
import { Link, useParams } from 'react-router-dom'
import AccountBalanceIcon from '@material-ui/icons/AccountBalance'
import moment from 'moment-timezone'
import numeral from 'numeral'
import OTable from '../organisms/OTable'
import React, { Fragment, useEffect, useState } from 'react'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import capitalize from 'lodash/capitalize'

const PLoans = () => {
  const { status } = useParams()

  const { _id: userId, branchId, role, isAdmin, isLoanOfficer } = useAuth()

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetching,
    isFetchingNextPage,
    refetch,
    status: queryStatus,
  } = useSecureLoans({
    status: String(status)
      .replace('pending', 'awaitingManagerReview')
      .replace('approved', 'approvedByManager')
      .replace('all', ''),
    role,
    userId,
    branchId,
  })

  useEffect(() => {
    refetch()
  }, [refetch, status])

  return (
    <OTable
      title="Loans"
      slug="loans"
      icon={<AccountBalanceIcon />}
      status={status}
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      isFetching={isFetching}
      isFetchingNextPage={isFetchingNextPage}
      isLoading={isLoading}
      data={data}
      numberOfColumns={8 + (status === 'all' ? 1 : 0) + (isAdmin ? 1 : 0)}
      tabs={[
        {
          slug: 'pending',
          label: 'Pending',
          empty: isLoanOfficer ? (
            <Fragment>
              Fill in a loan application form in the mobile app
              <br />
              and the loan will show up here
            </Fragment>
          ) : (
            <Fragment>
              Ask a loan officer to fill in a loan application form in the
              mobile app
              <br />
              and the loan will show up here
            </Fragment>
          ),
        },
        {
          slug: 'approved',
          label: 'Approved',
          empty: isLoanOfficer ? (
            <Fragment>Loans approved by your branch manager</Fragment>
          ) : (
            <Fragment>
              Approve a loan from the “Pending” tab
              <br />
              and it will show up here
            </Fragment>
          ),
        },
        {
          slug: 'active',
          label: 'Active',
          empty: isLoanOfficer ? (
            <Fragment>Loans disbursed by your branch manager</Fragment>
          ) : (
            <Fragment>
              Disburse a loan from the “Approved” tab
              <br />
              and it will show up here
            </Fragment>
          ),
        },
        {
          slug: 'all',
          label: 'All',
          empty: isLoanOfficer ? (
            <Fragment>
              Fill in a loan application form in the mobile app
              <br />
              and the loan will show up here
            </Fragment>
          ) : (
            <Fragment>
              Ask a loan officer to fill in a loan application form in the
              mobile app
              <br />
              and the loan will show up here
            </Fragment>
          ),
        },
      ]}
    >
      <TableHead component="div" style={{ display: 'table-header-group' }}>
        <TableRow component="div" style={{ display: 'table-row' }}>
          <TableCell
            component="div"
            style={{ display: 'table-cell', width: 60 }}
          >
            Code
          </TableCell>
          {status === 'all' && (
            <TableCell component="div" style={{ display: 'table-cell' }}>
              Status
            </TableCell>
          )}
          <TableCell component="div" style={{ display: 'table-cell' }}>
            Client
          </TableCell>
          <TableCell component="div" style={{ display: 'table-cell' }}>
            Cycle
          </TableCell>
          {isAdmin && (
            <TableCell component="div" style={{ display: 'table-cell' }}>
              Branch
            </TableCell>
          )}
          <TableCell component="div" style={{ display: 'table-cell' }}>
            Loan Officer
          </TableCell>
          <TableCell component="div" style={{ display: 'table-cell' }}>
            Type
          </TableCell>
          <TableCell component="div" style={{ display: 'table-cell' }}>
            Duration
          </TableCell>
          <TableCell
            component="div"
            style={{ display: 'table-cell', textAlign: 'right' }}
          >
            Amount
          </TableCell>
          <TableCell
            component="div"
            style={{ display: 'table-cell', width: 60 }}
          >
            Date
          </TableCell>
        </TableRow>
      </TableHead>
      {queryStatus === 'success' && (
        <TableBody component="div" style={{ display: 'table-row-group' }}>
          {data.pages.map((group, i) => (
            <Fragment key={i}>
              {group.map(loan => {
                let duration

                const value = loan.duration.value

                switch (loan.duration.unit) {
                  case 'week':
                    duration = `${value} weeks`
                    break
                  case 'twoWeeks':
                    duration = `${value * 2} weeks`
                    break
                  case 'month':
                    duration = `${value} months`
                    break
                }

                return (
                  <TableRow
                    key={loan?._id}
                    hover
                    component={Link}
                    to={`/clients/${loan?.client._id}/loans/${loan?._id}`}
                    style={{ display: 'table-row' }}
                  >
                    <TableCell
                      component="div"
                      style={{ display: 'table-cell' }}
                    >
                      {loan.code}
                    </TableCell>
                    {status === 'all' && (
                      <TableCell
                        component="div"
                        style={{ display: 'table-cell' }}
                      >
                        {capitalize(
                          String(loan?.status)
                            .replace('awaitingManagerReview', 'pending')
                            .replace('approvedByManager', 'approved')
                            .replace('rejectedByManager', 'rejected')
                            .replace('notpaid', 'not paid')
                        )}
                      </TableCell>
                    )}
                    <TableCell
                      component="div"
                      style={{ display: 'table-cell' }}
                    >
                      {loan?.client?.lastName || 'MISSING'},{' '}
                      {loan?.client?.firstName || 'MISSING'}
                    </TableCell>
                    <TableCell
                      component="div"
                      style={{ display: 'table-cell' }}
                    >
                      {loan?.cycle}
                    </TableCell>
                    {isAdmin && (
                      <TableCell
                        component="div"
                        style={{ display: 'table-cell' }}
                      >
                        {loan?.branchName}
                      </TableCell>
                    )}
                    <TableCell
                      component="div"
                      style={{ display: 'table-cell' }}
                    >
                      {loan?.loanOfficerName}
                    </TableCell>
                    <TableCell
                      component="div"
                      style={{ display: 'table-cell' }}
                    >
                      {loan?.loanProductName}
                    </TableCell>
                    <TableCell
                      component="div"
                      style={{ display: 'table-cell' }}
                    >
                      {duration}
                    </TableCell>
                    <TableCell
                      component="div"
                      style={{ display: 'table-cell', textAlign: 'right' }}
                    >
                      USh{' '}
                      {numeral(
                        loan?.approvedAmount || loan?.requestedAmount || 0
                      ).format('0,0')}
                    </TableCell>
                    <TableCell
                      component="div"
                      style={{ display: 'table-cell' }}
                    >
                      {loan?.updatedAt
                        ? moment(loan.updatedAt)
                            .tz(timezone)
                            .format(timeFormat.default)
                        : '&nbsp;'}
                    </TableCell>
                  </TableRow>
                )
              })}
            </Fragment>
          ))}
        </TableBody>
      )}
    </OTable>
  )
}

export default PLoans
