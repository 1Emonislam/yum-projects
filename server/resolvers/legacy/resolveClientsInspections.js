const _ = require('lodash')

// @FIXME @TODO: refactor this resolver
const clientsInspections = async (__, ___, { user, dataSources }) => {
  let userGroups = []
  let filterClients = []
  if (user.role === 'branchManager') {
    userGroups = await dataSources.clientGroups.collection
      .find(
        {
          branchId: user.branchId,
        },
        { projection: { _id: 1 } }
      )
      .toArray()

    filterClients = await dataSources.clients.collection
      .find(
        { clientGroupId: { $in: userGroups.map(group => group._id) } },
        { projection: { _id: 1 } }
      )
      .toArray()
  }

  const query = {
    $or: [{ formType: 'application' }, { type: 'application' }],
    status: 'approved',
  }

  if (user.role === 'branchManager') {
    query.clientId = { $in: filterClients.map(client => client._id) }
  }

  const approvedLoanApplicationForms = await dataSources.forms.collection
    .find(query, {
      projection: {
        _id: 1,
        clientId: 1,
      },
    })
    .toArray()

  const relatedForms = await dataSources.forms.collection
    .find(
      {
        relatedFormId: {
          $in: approvedLoanApplicationForms.map(form => form._id),
        },
      },
      { projection: { _id: 1, relatedFormId: 1 } }
    )
    .toArray()

  const approvedLoanApplicationFormsWithoutInspections =
    approvedLoanApplicationForms.filter(form => {
      const inspectionForm = relatedForms.find(relatedForm =>
        relatedForm.relatedFormId.equals(form._id)
      )

      return !inspectionForm
    })

  const clients = await dataSources.clients.collection
    .find({
      _id: {
        $in: approvedLoanApplicationFormsWithoutInspections.map(
          form => form.clientId
        ),
      },
    })
    .toArray()

  const groups = await dataSources.clientGroups.collection
    .find({
      _id: { $in: clients.map(client => client.clientGroupId) },
    })
    .toArray()

  const data = approvedLoanApplicationFormsWithoutInspections.map(form => {
    const client = clients.find(client => client._id.equals(form.clientId))

    const { firstName, lastName, clientGroupId, admission } = client

    let clientAddress = ''

    if (admission) {
      clientAddress = admission?.address
    }

    const group = groups.find(group => group._id.equals(clientGroupId))

    const { branchId, name, meeting, status } = group

    const { address, dayOfWeek, frequency, startedAt } = meeting

    return {
      client: {
        _id: String(form.clientId),
        firstName,
        lastName,
        address: clientAddress || '',
      },
      group: {
        _id: String(clientGroupId),
        name,
        address,
        dayOfWeek,
        frequency,
        startedAt,
        status,
      },
      branch: { _id: String(branchId) },
      form: { _id: String(form._id) },
    }
  })

  const dataFiltered = data.filter(inspection => {
    return (
      inspection.branch._id === String(user.branchId) &&
      ['active', 'inactive'].includes(inspection.group.status)
    )
  })

  const groupedData = _.groupBy(dataFiltered, form => form.group._id)

  const clientInspections = Object.keys(groupedData).map(key => {
    return {
      _id: String(groupedData[key][0].group._id),
      name: groupedData[key][0].group.name,
      address: groupedData[key][0].group.address,
      dayOfWeek: groupedData[key][0].group.dayOfWeek,
      frequency: groupedData[key][0].group.frequency,
      startedAt: groupedData[key][0].group.startedAt,
      forms: groupedData[key],
    }
  })

  return clientInspections
}

module.exports = clientsInspections
