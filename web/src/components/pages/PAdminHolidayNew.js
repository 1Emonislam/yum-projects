import { dateInvalid, required, timezone, useInsertEvent } from 'shared'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import { useHistory } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useQueryClient } from 'react-query'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import Grid from '@material-ui/core/Grid'
import MFormCheckbox from '../molecules/MFormCheckbox'
import MFormTextField from '../molecules/MFormTextField'
import MGeneralErrorDialog from '../molecules/MGeneralErrorDialog'
import moment from 'moment-timezone'
import React, { useMemo, useState } from 'react'
import TAdmin from '../templates/TAdmin'
import Typography from '@material-ui/core/Typography'

const useStyles = makeStyles(theme => ({
  appbar: {
    borderBottomColor: theme.palette.grey[300],
    borderBottomStyle: 'solid',
    borderBottomWidth: 1,
  },
  bar: {
    borderBottom: '1px solid',
    borderBottomColor: theme.palette.grey[300],
  },
  button: {
    background: 'none',
    border: 0,
    padding: 0,
    margin: 0,
    cursor: 'pointer',
    textDecoration: 'underline',
    '&:focus': {
      outline: 'none',
    },
  },
  warning: {
    paddingLeft: 12,
    borderLeft: '8px solid',
    borderLeftColor: theme.palette.warning.main,
    '& svg': {
      marginLeft: -16,
    },
  },
  chip: {
    backgroundColor: theme.palette.warning.main,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  formControl: {
    width: '100%',
  },
  danger: {
    background: theme.palette.error.main,
    color: '#fff',
  },
}))

const PAdminHolidayNew = () => {
  const classes = useStyles()

  const space = 4

  const queryClient = useQueryClient()

  const [isProcessing, setIsProcessing] = useState(false)
  const [generalErrorDialog, setGeneralErrorDialog] = useState(false)

  const { control, handleSubmit, errors, setValue, watch } = useForm()

  const history = useHistory()

  const { mutate } = useInsertEvent()

  const startAt = watch('startAt')

  const endAt = watch('endAt')

  const yearly = watch('yearly')

  const dayPlus = watch('dayPlus')

  const dateFormat = useMemo(() => (yearly ? 'D/MM' : 'D/MM/YYYY'), [yearly])

  const onSubmit = data => {
    setIsProcessing(true)

    mutate(
      {
        type: 'create',
        obj: 'holiday',
        name: String(data.name).trim(),
        notes: String(data.notes).trim(),
        yearly: data.yearly,
        startAt: moment(String(data.startAt).trim(), dateFormat)
          .tz(timezone)
          .startOf('day')
          .format(),
        endAt:
          String(data.endAt).trim() !== ''
            ? moment(String(data.endAt).trim(), dateFormat)
                .tz(timezone)
                .endOf('day')
                .format()
            : moment(String(data.startAt).trim(), dateFormat)
                .tz(timezone)
                .endOf('day')
                .format(),
      },
      {
        onError: () => {
          setIsProcessing(false)
          setGeneralErrorDialog(true)
        },
        onSuccess: () => {
          setIsProcessing(false)

          queryClient.invalidateQueries('holidays')

          history.push('/admin/holidays')
        },
      }
    )
  }

  return (
    <TAdmin active="holidays">
      <form onSubmit={handleSubmit(onSubmit)} className={classes.form}>
        <Box
          display="flex"
          alignItems="center"
          pl={2}
          pr={1}
          className={classes.bar}
          height={53}
          flexShrink={0}
        >
          <Typography variant="h2">New holiday</Typography>
          <Box flexGrow={1} />
          {!isProcessing && (
            <Box p={1}>
              <Grid container spacing={1}>
                <Grid item>
                  <Button component={Link} to="/admin/holidays">
                    Cancel
                  </Button>
                </Grid>
                <Grid item>
                  <Button variant="contained" color="primary" type="submit">
                    Save
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}
          {isProcessing && (
            <Box pr={3}>
              <CircularProgress color="secondary" size={24} />
            </Box>
          )}
        </Box>
        <Box
          flexGrow={1}
          width="100%"
          overflow="auto"
          display="flex"
          justifyContent="center"
          pl={2}
          pr={1}
          pt={2}
          pb={8}
        >
          <Box display="flex" justifyContent="center">
            <Box width={460}>
              <Box pt={space}>
                <Box pb={3}>
                  <Typography variant="h2">Descriptions</Typography>
                </Box>
                <MFormTextField
                  label="Name"
                  name="name"
                  control={control}
                  errors={errors}
                  autoFocus
                />
                <MFormTextField
                  label="Notes"
                  name="notes"
                  control={control}
                  errors={errors}
                  rules={{}}
                />
              </Box>
              <Box pt={space} pb={space * 2}>
                <Box pb={1}>
                  <Typography variant="h2">Dates</Typography>
                </Box>
                <MFormCheckbox
                  label="Yearly holiday"
                  name="yearly"
                  control={control}
                  errors={errors}
                  rules={{}}
                />
                <MFormCheckbox
                  label="Lasts more than one day"
                  name="dayPlus"
                  control={control}
                  errors={errors}
                  rules={{}}
                />
                <Grid container spacing={1}>
                  <Grid item xs={dayPlus ? 6 : 12}>
                    <MFormTextField
                      label={dayPlus ? 'Start date' : 'Date'}
                      name="startAt"
                      control={control}
                      errors={errors}
                      helperText={dateFormat}
                      rules={{
                        validate: value => {
                          if (!moment(value, dateFormat).isValid()) {
                            return dateInvalid
                          }

                          const pattern = yearly
                            ? /[0-9]{1,2}\/[0-9]{2}/
                            : /[0-9]{1,2}\/[0-9]{2}\/[0-9]{4}/

                          const match = value.match(pattern)

                          if (
                            !match ||
                            match?.[0] !== String(match?.input).trim()
                          ) {
                            return `Please enter the date in ${dateFormat} format`
                          }

                          if (endAt && dayPlus) {
                            if (
                              moment(value, dateFormat).isSameOrAfter(
                                moment(endAt, dateFormat)
                              )
                            ) {
                              return 'Please enter the start date at least one day before the end date'
                            }
                          }

                          return true
                        },
                        required: { value: true, message: required },
                      }}
                    />
                  </Grid>
                  <Grid
                    item
                    xs={6}
                    style={{ display: dayPlus ? 'block' : 'none' }}
                  >
                    <MFormTextField
                      label="End date"
                      name="endAt"
                      control={control}
                      errors={errors}
                      helperText={dateFormat}
                      rules={{
                        validate: value => {
                          if (dayPlus) {
                            if (!moment(value, dateFormat).isValid()) {
                              return dateInvalid
                            }

                            const pattern = yearly
                              ? /[0-9]{1,2}\/[0-9]{2}/
                              : /[0-9]{1,2}\/[0-9]{2}\/[0-9]{4}/

                            const match = value.match(pattern)

                            if (
                              !match ||
                              match?.[0] !== String(match?.input).trim()
                            ) {
                              return `Please enter the date in ${dateFormat} format`
                            }

                            if (
                              moment(startAt, dateFormat).isSameOrAfter(
                                moment(value, dateFormat)
                              )
                            ) {
                              return 'Please enter the end date at least one day after the start date'
                            }

                            if (value === '') {
                              return required
                            }
                          }

                          return true
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Box>
        </Box>
      </form>
      <MGeneralErrorDialog
        visible={generalErrorDialog}
        onDismiss={() => setGeneralErrorDialog(false)}
      />
    </TAdmin>
  )
}

export default PAdminHolidayNew
