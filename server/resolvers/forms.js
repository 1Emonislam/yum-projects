const _ = require('lodash')
const { ObjectId } = require('mongodb')
const { buildAuthorizedQuery } = require('../utils')
const { defineAbilityFor } = require('../utils/defineAbility')

const resolvers = {
  form: async (__, argv, { dataSources }) => {
    const formId = argv?.query?._id

    const loanOfficerId =
      argv?.query?.clientId?.clientGroupId?.loanOfficerId?._id

    const branchId = argv?.query?.clientId?.clientGroupId?.branchId?._id

    if (loanOfficerId || branchId) {
      const id = formId ? { _id: ObjectId(formId) } : {}

      const loanOfficer = loanOfficerId
        ? { 'client.clientGroup.loanOfficerId': ObjectId(loanOfficerId) }
        : {}

      const branchManager = branchId
        ? { 'client.clientGroup.branchId': ObjectId(branchId) }
        : {}

      const forms = await dataSources.forms.collection
        .aggregate([
          {
            $lookup: {
              from: 'clients',
              localField: 'clientId',
              foreignField: '_id',
              as: 'client',
            },
          },
          {
            $unwind: {
              path: '$client',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'clientGroups',
              localField: 'client.clientGroupId',
              foreignField: '_id',
              as: 'client.clientGroup',
            },
          },
          {
            $unwind: {
              path: '$clientGroup',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $match: {
              ...id,
              // TODO: Find better names for the variables below
              ...loanOfficer,
              ...branchManager,
            },
          },
        ])
        .toArray()

      return forms.map(form => {
        if (!form.type) {
          form.type = form.formType
        }

        return form
      })[0]
    }

    const form = dataSources.forms.collection.findOne({
      _id: ObjectId(formId),
    })

    if (!form.type) {
      form.type = form.formType
    }

    return form
  },
  forms: async (__, argv, { dataSources, user }) => {
    const ability = defineAbilityFor(user)
    const authorizedQuery = buildAuthorizedQuery(ability, 'ClientGroup', 'read')

    // The main query

    let query = {}

    let limit = 0

    const clientId = argv?.query?.clientId?._id

    const status = argv?.query?.status

    const statusIn = argv?.query?.status_in

    const statusNin = argv?.query?.status_nin

    const idLt = argv?.query?._id_lt

    const limitNumber = argv?.limit

    if (clientId) {
      query.clientId = ObjectId(clientId)
    }

    if (statusIn) {
      query.status = {
        $in: statusIn,
      }
    }

    if (statusNin) {
      query.status = {
        $nin: statusNin,
      }
    }

    if (status) {
      query.status = status
    }

    if (idLt) {
      query._id = {
        $lt: ObjectId(idLt),
      }
    }

    if (limitNumber) {
      limit = limitNumber
    }

    const forms = await dataSources.forms.collection
      .find(query)
      .sort({ _id: -1 })
      .limit(limit)
      .toArray()

    // The secondary queries

    let clientGroupQuery = { ...authorizedQuery }

    const clientGroupStatusIn = argv?.query?.clientId?.clientGroupId?.status_in

    const clientGroupStatusNin =
      argv?.query?.clientId?.clientGroupId?.status_nin

    const clientGroupId = argv?.query?.clientId?.clientGroupId?._id

    const loanOfficerId =
      argv?.query?.clientId?.clientGroupId?.loanOfficerId?._id

    const branchId = argv?.query?.clientId?.clientGroupId?.branchId?._id

    if (clientGroupId) {
      clientGroupQuery._id = ObjectId(clientGroupId)
    }

    if (loanOfficerId) {
      clientGroupQuery.loanOfficerId = ObjectId(loanOfficerId)
    }

    if (branchId) {
      clientGroupQuery.branchId = ObjectId(branchId)
    }

    if (clientGroupStatusIn) {
      clientGroupQuery.status = {
        $in: clientGroupStatusIn,
      }
    }

    if (clientGroupStatusNin) {
      clientGroupQuery.status = {
        $nin: clientGroupStatusNin,
      }
    }

    const isClientGroupQueryEmpty = _.isEmpty(clientGroupQuery)

    // Wrap-up

    if (isClientGroupQueryEmpty || forms.length === 0) {
      return forms.map(form => {
        if (!form.type) {
          form.type = form.formType
        }

        return form
      })
    }

    const clients = await dataSources.clients.collection
      .find({
        _id: { $in: forms.map(form => form.clientId) },
      })
      .toArray()

    const clientGroups = await dataSources.clientGroups.collection
      .find({
        $or: clients.map(client => ({
          _id: ObjectId(client.clientGroupId),
          ...clientGroupQuery,
        })),
      })
      .toArray()

    return forms
      .filter(form => {
        const client = clients.find(
          client => String(client._id) === String(form.clientId)
        )

        if (!client) {
          return false
        }

        return (
          clientGroups.findIndex(
            clientGroup =>
              String(clientGroup._id) === String(client.clientGroupId)
          ) !== -1
        )
      })
      .map(form => {
        if (!form.type) {
          form.type = form.formType
        }

        return form
      })
  },
  formsCount: async (__, ___, { dataSources }) => {
    return dataSources.forms.collection.find().count()
  },
  application: async (parent, __, { dataSources }) => {
    if (!parent.application) {
      return
    }

    return dataSources.forms.findOneById(parent.application)
  },
  inspection: async (parent, __, { dataSources }) => {
    if (!parent.inspection) {
      return
    }

    return dataSources.forms.findOneById(parent.inspection)
  },
}

module.exports = resolvers
