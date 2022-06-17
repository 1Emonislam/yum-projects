import { useExportLoanReport } from 'shared'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import React, { Fragment, useState } from 'react'
import TableChartIcon from '@material-ui/icons/TableChart'
import TReports from '../templates/TReports'
import Typography from '@material-ui/core/Typography'

const PReportsLoans = () => {
  const [url, setUrl] = useState()
  const [error, setError] = useState(false)

  const { mutate, isLoading: isGenerating } = useExportLoanReport()

  const generateLoanReport = async () => {
    mutate(
      {},
      {
        onError: error => {
          console.error(error)
          setError(true)
        },
        onSuccess: data => {
          if (data) {
            setUrl(data)
            window.open(data, '_self')
          } else {
            setError(true)
            console.error('Loan report: URL not generated')
          }
        },
      }
    )
  }

  return (
    <TReports active="/admin/reports/loans">
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        width="100%"
      >
        {error && (
          <Box display="flex" flexDirection="column" alignItems="center">
            <TableChartIcon />
            <Box pt={2} pb={2}>
              <Typography variant="h2">
                Please refresh the page and try again
              </Typography>
            </Box>
            <Typography variant="body1" align="center">
              There was a problem with generating the loan report.
              <br />
              The Yam team has just been made aware of the problem,
              <br />
              but if it is urgent, please contact us.
            </Typography>
          </Box>
        )}
        {!error && (
          <Fragment>
            {!isGenerating && !url && (
              <div>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={generateLoanReport}
                >
                  Generate loan report
                </Button>
              </div>
            )}
            {isGenerating && !url && (
              <Box display="flex" flexDirection="column" alignItems="center">
                <CircularProgress color="secondary" size={24} />
                <Box pt={2} pb={2}>
                  <Typography variant="h2">
                    <span style={{ visibility: 'hidden' }}>…</span>Generating
                    loan report…
                  </Typography>
                </Box>
                <Typography variant="body1">
                  It will take up to 8 minutes
                  <br />
                  <br />
                </Typography>
              </Box>
            )}
            {!isGenerating && url && (
              <Box display="flex" flexDirection="column" alignItems="center">
                <TableChartIcon />
                <Box pt={2} pb={2}>
                  <Typography variant="h2">The loan report is ready</Typography>
                </Box>
                <Typography variant="body1" align="center">
                  If the download doesn’t start automatically in
                  <br />a few seconds, please{' '}
                  <a href={url}>download manually</a>
                </Typography>
              </Box>
            )}
          </Fragment>
        )}
      </Box>
    </TReports>
  )
}

export default PReportsLoans
