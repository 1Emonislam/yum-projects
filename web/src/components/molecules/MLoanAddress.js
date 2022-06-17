import React from 'react'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import MTable from './MTable'

const MLoanAddress = ({ address, label }) => (
  <MTable title={label}>
    <TableBody>
      <TableRow hover>
        <TableCell width="250">Village/Area:</TableCell>
        <TableCell>{address?.area}</TableCell>
      </TableRow>
      <TableRow hover>
        <TableCell>Sub–county:</TableCell>
        <TableCell>{address?.subcounty}</TableCell>
      </TableRow>
      <TableRow hover>
        <TableCell>County:</TableCell>
        <TableCell>{address?.county}</TableCell>
      </TableRow>
      <TableRow hover>
        <TableCell>District/Division:</TableCell>
        <TableCell>{address?.district}</TableCell>
      </TableRow>
      <TableRow hover>
        <TableCell>Notes:</TableCell>
        <TableCell>{address?.notes || '—'}</TableCell>
      </TableRow>
    </TableBody>
  </MTable>
)

export default MLoanAddress
