import React, { Fragment } from 'react'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'

const MLoanForecast = ({ area, label }) => (
  <Fragment>
    <TableRow>
      <TableCell colSpan="2">
        <strong>{label}</strong>
      </TableCell>
    </TableRow>
    <TableRow hover>
      <TableCell width="250">Monthly income:</TableCell>
      <TableCell>
        {area
          ? area?.monthlyIncome > 0
            ? new Intl.NumberFormat('en-Ug', {
                style: 'currency',
                currency: 'UGX',
              }).format(area?.monthlyIncome)
            : '—'
          : ''}
      </TableCell>
    </TableRow>
    <TableRow hover>
      <TableCell>Monthly expenditure:</TableCell>
      <TableCell>
        {area
          ? area?.monthlyExpenditure > 0
            ? new Intl.NumberFormat('en-Ug', {
                style: 'currency',
                currency: 'UGX',
              }).format(area?.monthlyExpenditure)
            : '—'
          : ''}
      </TableCell>
    </TableRow>
    <TableRow hover>
      <TableCell>Monthly profit:</TableCell>
      <TableCell>
        {area
          ? area?.monthlyIncome > 0 || area?.monthlyExpenditure > 0
            ? new Intl.NumberFormat('en-Ug', {
                style: 'currency',
                currency: 'UGX',
              }).format(area?.monthlyIncome - area?.monthlyExpenditure)
            : '—'
          : ''}
      </TableCell>
    </TableRow>
    <TableRow hover>
      <TableCell>Comment:</TableCell>
      <TableCell>{area?.comment || '—'}</TableCell>
    </TableRow>
  </Fragment>
)

export default MLoanForecast
