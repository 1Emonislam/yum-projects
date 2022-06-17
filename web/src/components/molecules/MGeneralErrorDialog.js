import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import React from 'react'

const MGeneralErrorDialog = ({ visible, onDismiss }) => (
  <Dialog open={visible} onClose={onDismiss}>
    <DialogTitle>
      <Box color="error.main">Error</Box>
    </DialogTitle>
    <DialogContent>
      <DialogContentText>
        Something went wrong. Please try again later or contact support.
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onDismiss} color="primary">
        OK
      </Button>
    </DialogActions>
  </Dialog>
)

export default MGeneralErrorDialog
