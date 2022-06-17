import React, { Fragment } from 'react'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import MLoanPhoto from './MLoanPhoto'
import MLoanSignature from './MLoanSignature'

const MLoanGuarantor = ({ guarantor, index }) => (
  <Fragment>
    <TableRow>
      <TableCell colSpan="2">
        <strong>Guarantor #{Number(Number(index) + 1)}</strong>
      </TableCell>
    </TableRow>
    <TableRow hover>
      <TableCell width="250">Name:</TableCell>
      <TableCell>{guarantor?.name}</TableCell>
    </TableRow>
    <TableRow hover>
      <TableCell>Relation with the client:</TableCell>
      <TableCell>{guarantor?.relation}</TableCell>
    </TableRow>
    <TableRow hover>
      <TableCell>National ID or Voter ID number:</TableCell>
      <TableCell>{guarantor?.nationalVoterIdNumber}</TableCell>
    </TableRow>
    <MLoanPhoto
      photo={guarantor?.nationalVoterIdPhoto}
      label="National ID or Voter ID photo"
      context={`Guarantor #${Number(
        Number(index) + 1
      )}’s National ID or Voter ID photo`}
    />
    <MLoanPhoto
      photo={guarantor?.photo}
      label="Photo of the guarantor"
      context={`Guarantor #${Number(Number(index) + 1)}`}
    />
    <MLoanSignature
      signature={guarantor?.signature}
      label="Signature"
      context={`Guarantor #${Number(Number(index) + 1)}’s signature`}
    />
  </Fragment>
)

export default MLoanGuarantor
