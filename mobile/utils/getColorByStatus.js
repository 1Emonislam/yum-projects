import { Colors } from '@constants'

export const getColorByStatus = (status, alt) => {
  status = status?.toLowerCase()
  return (
    {
      invited: Colors.cyan,
      active: Colors.green,
      approved: Colors.green,
      approvedbymanager: Colors.green,
      provided: Colors.green,
      'to survey': alt ? Colors.orangeAlt : Colors.orange,
      tosurvey: alt ? Colors.orangeAlt : Colors.orange,
      surveyed: alt ? Colors.orangeAlt : Colors.orange,
      pending: alt ? Colors.orangeAlt : Colors.orange,
      awaitingmanagerreview: alt ? Colors.orangeAlt : Colors.orange,
      expired: alt ? Colors.orangeAlt : Colors.orange,
      rejectedbymanager: Colors.red,
      rejected: Colors.red,
      missing: Colors.red,
    }[status] ?? Colors.placeholder
  )
}
