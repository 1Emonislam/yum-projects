import { DateTime } from 'luxon'

let data = {}

data.meetings = Array.from(Array(32).keys()).map(index => {
  return {
    start: DateTime.fromObject({
      weekday: 3,
      hour: 16,
      minute: 33 - Math.floor(Math.random() * 7),
      zone: 'Africa/Kampala',
    }).minus({ weeks: index }),
    leader: 'Lastname, Firstname',
    place: 'Mpuuga Plaza, 8 Broadway Rd, Masaka',
    clients: 10 - Math.floor(Math.random() * 2),
    installments: 352000 - Math.floor(Math.random() * 20) * 500,
    requests: Math.floor(Math.random() * 2),
    notes: Math.floor(Math.random() * 2),
  }
})

export default data
