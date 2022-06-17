import {
  getClientRole,
  timeFormat,
  timezone,
  useAuth,
  useSecureBranches,
  useSecureClients,
  useSecureClientGroupsByBranchId,
} from 'shared'
import { Link, useHistory, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import Box from '@material-ui/core/Box'
import MFormSelect from '../molecules/MFormSelect'
import moment from 'moment-timezone'
import OTable from '../organisms/OTable'
import PersonIcon from '@material-ui/icons/Person'
import React, { Fragment, useEffect, useMemo } from 'react'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'

const PClients = () => {
  const {
    _id: userId,
    branchId: userRelatedBranchId,
    role,
    isAdmin,
    isLoanOfficer,
    isAreaOrRegionalManager,
  } = useAuth()

  const {
    status,
    branchId = (isAdmin || isAreaOrRegionalManager) ? '' : userRelatedBranchId,
    clientGroupId,
  } = useParams()

  const history = useHistory()

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetching,
    isFetchingNextPage,
    refetch,
    status: queryStatus,
  } = useSecureClients({
    status,
    role,
    userId,
    branchId,
    clientGroupId,
  })

  const { data: rawBranches = [], isFetching: isFetchingBranches } =
    useSecureBranches({
      status,
      role,
      userId,
      branchId,
    })

  const { data: rawClientGroups = [], isFetching: isFetchingClientGroups } =
    useSecureClientGroupsByBranchId({
      role,
      userId,
      branchId,
      sortBy: 'name',
    })

  const branches = useMemo(() => {
    // console.log(rawBranches)
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

  const clientGroups = useMemo(() => {
    //console.log(rawClientGroups)
    return [
      {
        value: '',
        label: 'All groups',
      },
      ...rawClientGroups.map(clientGroup => {
        return {
          value: String(clientGroup._id),
          label: clientGroup.name,
        }
      }),
    ]
  }, [rawClientGroups])

  const { control, errors, register, setValue, watch } = useForm()

  const branch = watch('branch', (isAdmin || isAreaOrRegionalManager) ? '' : userRelatedBranchId)
  const clientGroup = watch('clientGroup')

  useEffect(() => {
    if ((isAdmin || isAreaOrRegionalManager) && !isFetchingBranches && !isFetchingClientGroups) {
      if (branch && branch !== '' && branch !== 'undefined') {
        setValue('clientGroup', '')
        history.push(`/clients/${status}/${branch}`)
      } else if (branch === '') {
        setValue('clientGroup', '')
        history.push(`/clients/${status}`)
      }
    }
  }, [branch, status])

  useEffect(() => {
    if (
      !isFetchingBranches &&
      !isFetchingClientGroups &&
      branch &&
      branch !== '' &&
      branch !== 'undefined'
    ) {
      if (clientGroup && clientGroup !== '') {
        history.push(`/clients/${status}/${branch}/${clientGroup}`)
      } else if ((isAdmin || isAreaOrRegionalManager) && (!clientGroup || clientGroup === '')) {
        history.push(`/clients/${status}/${branch}`)
      } else if (!(isAdmin || isAreaOrRegionalManager) && (!clientGroup || clientGroup === '')) {
        history.push(`/clients/${status}`)
      }
    }
  }, [clientGroup, status])

  useEffect(() => {
    refetch()
  }, [refetch, status])

  const suffix = useMemo(() => {
    if (branch === '' && clientGroup === '') {
      return ''
    } else if (clientGroup && clientGroup !== '') {
      return `/${branch}/${clientGroup}`
    } else if (branch && branch !== '') {
      return `/${branch}`
    }
  }, [branch, clientGroup])
// console.log(suffix)
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
                defaultValue={branchId || ''}
              />
            </Box>
          )}
          <Box width={256} ml={1}>
            <MFormSelect
              name="clientGroup"
              control={control}
              errors={errors}
              options={clientGroups}
              defaultValue={clientGroupId || ''}
              disabled={(isAdmin || isAreaOrRegionalManager) && branch === ''}
            />
          </Box>
        </Box>
      </form>
    </Fragment>
  )

  return (
    <OTable
      title="Clients"
      slug="clients"
      icon={<PersonIcon />}
      status={status}
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      isFetching={isFetching}
      isFetchingNextPage={isFetchingNextPage}
      isLoading={isLoading}
      data={data}
      numberOfColumns={4 + ((isAdmin || isAreaOrRegionalManager) ? 1 : 0)}
      dropdowns={dropdowns}
      suffix={suffix}
      tabs={[
        {
          slug: 'active',
          label: 'Active',
          empty: isLoanOfficer ? (
            <Fragment>
              Add a client in the mobile app
              <br />
              and it will show up here
            </Fragment>
          ) : (
            <Fragment>
              Ask loan officer to add a client in the mobile app
              <br />
              and it will show up here
            </Fragment>
          ),
        },
        {
          slug: 'surveyed',
          label: 'Surveyed',
          empty: isLoanOfficer ? (
            <Fragment>
              Survey a client in the mobile app
              <br />
              and it will show up here
            </Fragment>
          ) : (
            <Fragment>
              Ask loan officer to survey a client in the mobile app
              <br />
              and it will show up here
            </Fragment>
          ),
        },
        {
          slug: 'inactive',
          label: 'Inactive',
          empty: (
            <Fragment>
              Clients without active loans
              <br />
              will show up here
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
            style={{ display: 'table-cell', width: '30%' }}
          >
            Name
          </TableCell>
          <TableCell
            component="div"
            style={{ display: 'table-cell', width: '30%' }}
          >
            Group
          </TableCell>
          <TableCell
            component="div"
            style={{ display: 'table-cell', width: '30%' }}
          >
            Branch
          </TableCell>

          {/* <TableCell style={{ width: '30%' }}>Role</TableCell> */}
          <TableCell
            component="div"
            style={{ display: 'table-cell', width: 120 }}
          >
            Last&nbsp;updated
          </TableCell>
          {/* TODO: */}
          {/* {!isLoanOfficer && (
            <TableCell style={{ width: '20%' }}>Acquired by</TableCell>
          )} */}
        </TableRow>
      </TableHead>
      {queryStatus === 'success' && (
        <TableBody component="div" style={{ display: 'table-row-group' }}>
          {data.pages.map((group, i) => (
            <Fragment key={i}>
              {group.map(client => {
                const clientRole = getClientRole(client._id, client.clientGroup)

                return (
                  <TableRow
                    key={client._id}
                    hover
                    component={Link}
                    to={`/clients/${client._id}`}
                    style={{ display: 'table-row' }}
                  >
                    <TableCell
                      component="div"
                      style={{ display: 'table-cell' }}
                    >
                      {client.code}
                    </TableCell>
                    <TableCell
                      component="div"
                      style={{ display: 'table-cell' }}
                    >
                      {client.lastName}, {client.firstName}
                    </TableCell>
                    <TableCell
                      component="div"
                      style={{ display: 'table-cell' }}
                    >
                      {client.clientGroup.name}
                    </TableCell>
                    <TableCell
                      component="div"
                      style={{ display: 'table-cell' }}
                      style={{ width: '30%' }}
                    >
                      {client.clientGroup.branch.name}
                    </TableCell>
                    <TableCell
                      component="div"
                      style={{ display: 'table-cell' }}
                    >
                      {client.updatedAt
                        ? moment(client.updatedAt)
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

export default PClients
