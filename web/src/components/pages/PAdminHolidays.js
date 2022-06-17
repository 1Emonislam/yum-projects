import { timeFormat, timezone, useAuth, useHolidays } from 'shared'
import { Link } from 'react-router-dom'
import moment from 'moment-timezone'
import OAdminTable from '../organisms/OAdminTable'
import React, { Fragment, useEffect } from 'react'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Box from '@material-ui/core/Box'
import TAdmin from '../templates/TAdmin'
import DoneIcon from '@material-ui/icons/Done'

const PAdminHolidays = () => {
  const { data, isFetching, isLoading } = useHolidays()

  const byTime = (a, b) => {
    const aStart = moment(a.startAt).tz(timezone)
    const bStart = moment(b.startAt).tz(timezone)

    if ((a.yearly && b.yearly) || (!a.yearly && !b.yearly)) {
      if (aStart.year() === bStart.year()) {
        return bStart.dayOfYear() - aStart.dayOfYear()
      }

      if (aStart.year() > bStart.year()) {
        return -1
      }

      if (aStart.year() < bStart.year()) {
        return 1
      }
    }

    if (a.yearly) {
      return -1
    }

    if (b.yearly) {
      return 1
    }

    return 0
  }

  return (
    <TAdmin active="holidays">
      <OAdminTable
        slug="holidays"
        newItem="holiday"
        isFetching={isFetching}
        isLoading={isLoading}
        data={data}
      >
        <TableHead component="div" style={{ display: 'table-header-group' }}>
          <TableRow component="div" style={{ display: 'table-row' }}>
            <TableCell component="div" style={{ display: 'table-cell' }}>
              Name
            </TableCell>
            <TableCell
              component="div"
              style={{ display: 'table-cell' }}
              width="60"
              align="center"
            >
              Yearly
            </TableCell>
            <TableCell
              component="div"
              style={{ display: 'table-cell' }}
              align="right"
            >
              Start
            </TableCell>
            <TableCell
              component="div"
              style={{ display: 'table-cell' }}
              align="right"
            >
              End
            </TableCell>
            <TableCell component="div" style={{ display: 'table-cell' }}>
              Notes
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody component="div" style={{ display: 'table-row-group' }}>
          {data
            ?.map(holiday => {
              let startAt = moment(holiday.startAt).tz(timezone)

              let endAt = moment(holiday.endAt).tz(timezone)

              if (holiday.yearly) {
                startAt.year(moment().year())

                if (startAt.isBefore(moment(), 'day')) {
                  startAt.add(1, 'y')
                }
              }

              if (holiday.yearly) {
                endAt.year(moment().year())

                if (endAt.isBefore(moment())) {
                  endAt.add(1, 'y')
                }
              }

              holiday.startAt = startAt
              holiday.endAt = endAt

              return holiday
            })
            .sort(byTime)
            .map(holiday => (
              <TableRow
                key={holiday._id}
                hover
                component={Link}
                to={`/admin/holidays/${holiday._id}`}
                style={{ display: 'table-row' }}
              >
                <TableCell component="div" style={{ display: 'table-cell' }}>
                  {holiday.name}
                </TableCell>
                <TableCell
                  component="div"
                  style={{ display: 'table-cell' }}
                  padding="none"
                  align="center"
                >
                  <Box display="flex" justifyContent="center" pr={1}>
                    {holiday.yearly && <DoneIcon fontSize="small" />}
                  </Box>
                </TableCell>
                <TableCell
                  component="div"
                  style={{ display: 'table-cell' }}
                  align="right"
                >
                  {moment(holiday.startAt).format(timeFormat.holiday)}
                </TableCell>
                <TableCell
                  component="div"
                  style={{ display: 'table-cell' }}
                  align="right"
                >
                  {moment(holiday.endAt).isSame(moment(holiday.startAt), 'day')
                    ? '—'
                    : moment(holiday.endAt).format(timeFormat.holiday)}
                </TableCell>
                <TableCell component="div" style={{ display: 'table-cell' }}>
                  {holiday.notes}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </OAdminTable>
    </TAdmin>
  )
}

export default PAdminHolidays
