import { timeFormat, timezone, useAuth, useSecureForms, useAuthorizationWithRerendering } from 'shared'
import { Link, useParams } from 'react-router-dom'
import AssignmentIcon from '@material-ui/icons/Assignment'
import moment from 'moment-timezone'
import OTable from '../organisms/OTable'
import React, { Fragment, useEffect } from 'react'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'

const PForms = () => {
  const { status } = useParams()

  const { _id: userId, branchId, role, isLoanOfficer } = useAuth()

  const ability = useAuthorizationWithRerendering()
  // console.log('Demonstrating AuthZ in UI')
  // console.log("[ability.can('create', 'Form')]:", ability.can('create', 'Form'))
  // console.log("[ability.can('read', 'Form')]:", ability.can('read', 'Form'))

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetching,
    isFetchingNextPage,
    refetch,
    status: queryStatus,
  } = useSecureForms({
    status,
    role,
    userId,
    branchId,
  })

  useEffect(() => {
    refetch()
  }, [refetch, status])

  return (
    <OTable
      title="Forms"
      slug="forms"
      icon={<AssignmentIcon />}
      status={status}
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      isFetching={isFetching}
      isFetchingNextPage={isFetchingNextPage}
      isLoading={isLoading}
      data={data}
      numberOfColumns="5"
      tabs={[
        {
          slug: 'pending',
          label: 'Pending',
          empty: isLoanOfficer ? (
            <Fragment>
              Fill in a form in the mobile app
              <br />
              and it will show up here
            </Fragment>
          ) : (
            <Fragment>
              Ask a loan officer to fill in a form in the mobile app
              <br />
              and it will show up here
            </Fragment>
          ),
        },
        {
          slug: 'approved',
          label: 'Approved',
          empty: isLoanOfficer ? (
            <Fragment>
              Forms approved by your branch manager
              <br />
              will show up here
            </Fragment>
          ) : (
            <Fragment>
              Approve a form from the “Pending” tab
              <br />
              and it will show up here
            </Fragment>
          ),
        },
        {
          slug: 'rejected',
          label: 'Rejected',
          empty: isLoanOfficer ? (
            <Fragment>
              Forms rejected by your branch manager
              <br />
              will show up here
            </Fragment>
          ) : (
            <Fragment>
              Reject a form from the “Pending” tab
              <br />
              and it will show up here
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
          <TableCell
            component="div"
            style={{ display: 'table-cell', width: '33%' }}
          >
            Type
          </TableCell>
          <TableCell
            component="div"
            style={{ display: 'table-cell', width: '33%' }}
          >
            Group
          </TableCell>
          <TableCell
            component="div"
            style={{ display: 'table-cell', width: '33%' }}
          >
            Respondent
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
              {group.map(form => (
                <TableRow
                  key={form._id}
                  hover
                  component={Link}
                  to={`/clients/${form.client._id}/forms/${form._id}`}
                  style={{ display: 'table-row' }}
                >
                  <TableCell component="div" style={{ display: 'table-cell' }}>
                    {form.code}
                  </TableCell>
                  <TableCell component="div" style={{ display: 'table-cell' }}>
                    {form.type === 'application'
                      ? 'Loan application'
                      : 'Client inspection'}
                  </TableCell>
                  <TableCell component="div" style={{ display: 'table-cell' }}>
                    {form.client.clientGroup.name}
                  </TableCell>
                  <TableCell component="div" style={{ display: 'table-cell' }}>
                    {form.client.lastName}, {form.client.firstName}
                  </TableCell>
                  <TableCell component="div" style={{ display: 'table-cell' }}>
                    {form.updatedAt
                      ? moment(form.updatedAt)
                          .tz(timezone)
                          .format(timeFormat.default)
                      : '&nbsp;'}
                  </TableCell>
                </TableRow>
              ))}
            </Fragment>
          ))}
        </TableBody>
      )}
    </OTable>
  )
}

export default PForms
