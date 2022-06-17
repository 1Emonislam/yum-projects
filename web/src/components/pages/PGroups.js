import { useMemo } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useAuth, useSecureClientGroupsWithLimit, useSecureBranches } from 'shared'
import { Link, useParams, useHistory } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import capitalize from 'lodash/capitalize'
import GroupIcon from '@material-ui/icons/Group'
import moment from 'moment-timezone'
import OTable from '../organisms/OTable'
import React, { Fragment, useEffect } from 'react'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Box from '@material-ui/core/Box'
import MFormSelect from '../molecules/MFormSelect'

const useStyles = makeStyles(theme => ({
  nowrap: {
    whiteSpace: 'nowrap',
  },
}))

const PGroups = () => {
  const { _id: userId, branchId: userRelatedBranchId, role, isLoanOfficer, isAdmin, isAreaOrRegionalManager } = useAuth()
  const { status, branchId = (isAdmin || isAreaOrRegionalManager) ? '' : userRelatedBranchId } = useParams()

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetching,
    isFetchingNextPage,
    refetch,
    status: queryStatus,
  } = useSecureClientGroupsWithLimit({
    status: String(status).replace('all', ''),
    role,
    userId,
    branchId,
  })

  const history = useHistory()

  const { data: rawBranches = [], isFetching: isFetchingBranches } =
    useSecureBranches({
      status,
      role,
      userId,
      branchId,
    })

  const branches = useMemo(() => {
    return [
      {
        value: '',
        label: 'All branches',
      },
      ...rawBranches.map(branch => {
        return {
          value: String(branch._id),
          label: branch.name,
        }
      }),
    ]
  }, [rawBranches])

  const { control, errors, watch } = useForm()

  const branch = watch('branch', (isAdmin || isAreaOrRegionalManager) ? '' : userRelatedBranchId)

  useEffect(() => {
    if ((isAdmin || isAreaOrRegionalManager) && !isFetchingBranches) {
      if (branch && branch !== '' && branch !== 'undefined') {
        history.push(`/groups/${status}/${branch}`)
      } else if (branch === '') {
        history.push(`/groups/${status}`)
      }
    }
  }, [branch, history, isAdmin, isAreaOrRegionalManager, isFetchingBranches, status])

  const suffix = useMemo(() => {
    if (branch === '') {
      return ''
    } else if (branch && branch !== '') {
      return `/${branch}`
    }
  }, [branch])

  const classes = useStyles()

  useEffect(() => {
    refetch()
  }, [refetch, status])

  const dropdowns = (
    <Fragment>
      <form>
        <Box display="flex" justifyContent="end">
          {(isAdmin || isAreaOrRegionalManager) && (
            <Box width={144}>
              <MFormSelect
                name="branch"
                control={control}
                errors={errors}
                options={branches}
                defaultValue={''}
              />
          </Box>
          )}
        </Box>
      </form>
    </Fragment>
  )

  return (
    <OTable
      title="Groups"
      slug="groups"
      icon={<GroupIcon />}
      status={status}
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      isFetching={isFetching}
      isFetchingNextPage={isFetchingNextPage}
      isLoading={isLoading}
      data={data}
      numberOfColumns={7 + (status === 'all' ? 1 : 0)}
      dropdowns={dropdowns}
      suffix={suffix}
      tabs={[
        {
          slug: 'pending',
          label: 'Pending',
          empty: isLoanOfficer ? (
            <Fragment>
              Add a group in the mobile app, submit it for approval
              <br />
              and it will show up here
            </Fragment>
          ) : (
            <Fragment>
              Ask a loan officer to add a group in the mobile app and submit it
              for approval
              <br />
              and it will show up here
            </Fragment>
          ),
        },
        {
          slug: 'active',
          label: 'Active',
          empty: isLoanOfficer ? (
            <Fragment>
              Groups approved by your branch manager
              <br />
              will show up here
            </Fragment>
          ) : (
            <Fragment>
              Approve a group from the “Pending” tab
              <br />
              and it will show up here
            </Fragment>
          ),
        },
        // TODO:
        // {
        //   slug: 'inactive',
        //   label: 'Inactive',
        //   empty: (
        //     <Fragment>
        //       When there is no single active loan in a group,
        //       <br />
        //       the group will show up here
        //     </Fragment>
        //   ),
        // },
        {
          slug: 'all',
          label: 'All',
          empty: isLoanOfficer ? (
            <Fragment>
              Add a group in the mobile app, submit it for approval
              <br />
              and it will show up here
            </Fragment>
          ) : (
            <Fragment>
              Ask a loan officer to add a group in the mobile app and submit it
              for approval
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
            style={{ display: 'table-cell', width: 60 }}
          >
            Name
          </TableCell>
          {status === 'all' && (
            <TableCell
              component="div"
              style={{ display: 'table-cell', width: 60 }}
            >
              Status
            </TableCell>
          )}
          <TableCell
            component="div"
            style={{ display: 'table-cell', width: 60 }}
          >
            Branch
          </TableCell>
          <TableCell
            component="div"
            style={{ display: 'table-cell', width: 60 }}
            className={classes.nowrap}
          >
            Loan Officer
          </TableCell>
          <TableCell
            component="div"
            style={{ display: 'table-cell', width: 60 }}
            className={classes.nowrap}
          >
            Meeting day
          </TableCell>
          <TableCell
            component="div"
            style={{ display: 'table-cell', width: 60 }}
            className={classes.nowrap}
          >
            Meeting time
          </TableCell>
          <TableCell
            component="div"
            style={{ display: 'table-cell', width: 60 }}
          >
            Meeting place
          </TableCell>
          {/* TODO: */}
          {/* <TableCell>Registered clients</TableCell>
              <TableCell>Active clients</TableCell>
              <TableCell>Realization</TableCell>
              <TableCell>Savings</TableCell>
              <TableCell>Loan outstanding</TableCell>
              <TableCell>Started</TableCell> */}
        </TableRow>
      </TableHead>
      {queryStatus === 'success' && (
        <TableBody component="div" style={{ display: 'table-row-group' }}>
          {data.pages.map((group, i) => (
            <Fragment key={i}>
              {group.map(group => (
                <TableRow
                  key={group._id}
                  hover
                  component={Link}
                  to={`/groups/${group._id}`}
                  style={{ display: 'table-row' }}
                >
                  <TableCell component="div" style={{ display: 'table-cell' }}>
                    {group.code}
                  </TableCell>
                  <TableCell
                    component="div"
                    style={{ display: 'table-cell' }}
                    className={classes.nowrap}
                  >
                    {group.name}
                  </TableCell>
                  {status === 'all' && (
                    <TableCell
                      component="div"
                      style={{ display: 'table-cell' }}
                    >
                      {capitalize(group.status)}
                    </TableCell>
                  )}
                  <TableCell component="div" style={{ display: 'table-cell' }}>
                    {group.branch.name}
                  </TableCell>
                  <TableCell
                    component="div"
                    style={{ display: 'table-cell' }}
                    className={classes.nowrap}
                  >
                    {group.loanOfficer.lastName}, {group.loanOfficer.firstName}
                  </TableCell>
                  <TableCell component="div" style={{ display: 'table-cell' }}>
                    {moment(
                      moment().isoWeekday(group.meeting.dayOfWeek)
                    ).format('dddd')}
                  </TableCell>
                  <TableCell component="div" style={{ display: 'table-cell' }}>
                    {group.meeting.time}
                  </TableCell>
                  <TableCell component="div" style={{ display: 'table-cell' }}>
                    {group.meeting.address}
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

export default PGroups
