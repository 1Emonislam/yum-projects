import React, { Fragment } from 'react'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'

const MLoanUtilization = ({ category, label }) => (
  <Fragment>
    <TableRow>
      <TableCell colSpan="2">
        <strong>{label}</strong>
      </TableCell>
    </TableRow>
    <TableRow hover>
      <TableCell width="250">Cost:</TableCell>
      <TableCell>
        {category?.cost
          ? new Intl.NumberFormat('en-Ug', {
              style: 'currency',
              currency: 'UGX',
            }).format(category?.cost)
          : '—'}
      </TableCell>
    </TableRow>
    <TableRow hover>
      <TableCell>Value of present item:</TableCell>
      <TableCell>
        {category?.cost
          ? new Intl.NumberFormat('en-Ug', {
              style: 'currency',
              currency: 'UGX',
            }).format(category?.value)
          : '—'}
      </TableCell>
    </TableRow>
    <TableRow hover>
      <TableCell>The items as security:</TableCell>
      <TableCell>{category?.security || '—'}</TableCell>
    </TableRow>
  </Fragment>
)

export default MLoanUtilization
