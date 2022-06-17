import moment from 'moment'

export const isPastMeeting = meeting => {
  const now = moment()
  const nowInMinutes = now.minutes() + now.hours() * 60

  const { time } = meeting
  let [meetingHours, meetingMinutes] = time.split(':')
  const meetingInMinutes =
    parseInt(meetingHours) * 60 + parseInt(meetingMinutes)

  return nowInMinutes > meetingInMinutes
}
