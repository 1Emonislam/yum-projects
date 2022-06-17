export const getClientRole = (clientId, clientGroup) => {
  switch (clientId) {
    case undefined:
      return ''
    case clientGroup?.president?._id:
      return 'President'
    case clientGroup?.secretary?._id:
      return 'Secretary'
    case clientGroup?.cashier?._id:
      return 'Cashier'
    default:
      return 'Member'
  }
}
