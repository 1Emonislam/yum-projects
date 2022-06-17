const _ = require('lodash')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const { disconnect } = require('./client')
const MongoDB = require('mongodb')

const { ObjectId } = MongoDB

const argv = yargs(hideBin(process.argv)).argv

const saveToMongo = async (data, db, notes = []) => {
  const importedAt = new Date()
  const importId = new ObjectId()
  const importNotes = notes.join('; ')

  if (argv.dryRun || argv.verbose) {
    console.dir(
      {
        ...data,
        // clients: data.clients.map(client => ({
        //   ...client,
        //   _id: client._id.toHexString(),
        //   clientGroupId: String(client.clientGroupId),
        //   loans: client.loans.map(loan => String(loan)),
        // })),
        // clientsToUpdate: data.clientsToUpdate.map(client => ({
        //   ...client,
        //   _id: client._id.toHexString(),
        //   loans: client.loans.map(loan => String(loan)),
        // })),
        // loans: data.loans.map(loan => ({
        //   _id: String(loan._id),
        //   clientId: String(loan.clientId),
        //   clientGroupId: String(loan.clientGroupId),
        //   branchId: String(loan.branchId),
        //   // installments: loan.installments.map(i => i.due),
        // })),
      },
      { depth: Infinity }
    )

    for (let [collName, coll] of Object.entries(data)) {
      console.log('Collection', collName)
      if (collName === 'clients') {
        for (let client of data.clients) {
          console.dir(
            {
              ...client,
              _id: client._id.toHexString(),
              clientGroupId: String(client.clientGroupId),
              loans: client.loans.map(loan => String(loan)),
            },
            { depth: Infinity }
          )
        }

        continue
      }

      if (collName === 'clientsToUpdate') {
        for (let client of data.clientsToUpdate) {
          console.dir(
            {
              ...client,
              _id: client._id.toHexString(),
              loans: client.loans.map(loan => String(loan)),
            },
            { depth: Infinity }
          )
        }

        continue
      }

      if (collName === 'loans') {
        for (let loan of data.loans) {
          console.dir(
            {
              _id: String(loan._id),
              clientId: String(loan.clientId),
              clientGroupId: String(loan.clientGroupId),
              branchId: String(loan.branchId),
              // installments: loan.installments.map(i => i.due),
            },
            { depth: Infinity }
          )
        }

        continue
      }

      for (let obj of coll) {
        console.dir(obj, { depth: Infinity })
      }
    }
  }

  if (argv.dryRun) {
    process.exit()
  }

  const eventsToProcess = []

  try {
    if (data.branches.length > 0) {
      console.log('Adding new branches')

      const branchesEvents = _.uniqBy(data.branches, 'name').map(branch => ({
        type: 'create',
        obj: 'branch',
        objId: branch._id,
        payload: {
          ..._.omit(branch, ['_id']),
        },
        timestamp: new Date(),
        importedAt,
        importId,
        importNotes,
      }))

      eventsToProcess.push(...branchesEvents)

      await db.collection('events').insertMany(branchesEvents)
      await db.collection('branches').insertMany(
        branchesEvents.map(event => ({
          _id: event.objId,
          createdAt: event.timestamp,
          updatedAt: event.timestamp,
          ...event.payload,
        }))
      )
    }

    if (data.users.length > 0) {
      console.log('Adding users')
      const usersEvents = _.uniqBy(
        data.users,
        user => user.fullPhoneNumber
      ).map(loanOfficer => ({
        type: 'create',
        obj: 'user',
        objId: loanOfficer._id,
        payload: {
          ..._.omit(loanOfficer, ['_id', '_seed']),
        },
        timestamp: new Date(),
        importedAt,
        importId,
        importNotes,
      }))

      eventsToProcess.push(...usersEvents)

      await db.collection('events').insertMany(usersEvents)
      await db.collection('users').insertMany(
        usersEvents.map(event => ({
          _id: event.objId,
          createdAt: event.timestamp,
          updatedAt: event.timestamp,
          ...event.payload,
        }))
      )
    }

    if (data.clients.length > 0) {
      console.log('Adding new clients')
      const clientsEvents = data.clients.map(client => ({
        type: 'create',
        obj: 'client',
        objId: client._id,
        payload: {
          ..._.omit(client, ['_id']),
        },
        timestamp: new Date(),
        importedAt,
        importId,
        importNotes,
      }))

      eventsToProcess.push(...clientsEvents)

      await db.collection('events').insertMany(clientsEvents)
      await db.collection('clients').insertMany(
        clientsEvents.map(event => ({
          _id: event.objId,
          createdAt: event.timestamp,
          updatedAt: event.timestamp,
          ...event.payload,
        }))
      )
    }

    if (data.clientGroups.length > 0) {
      console.log('Adding new groups')
      const groupsEvents = data.clientGroups.map(clientGroup => ({
        type: 'create',
        obj: 'clientGroup',
        objId: clientGroup._id,
        payload: {
          ..._.omit(clientGroup, ['_id']),
        },
        timestamp: new Date(),
        importedAt,
        importId,
        importNotes,
      }))

      eventsToProcess.push(...groupsEvents)
      await db.collection('events').insertMany(groupsEvents)
      await db.collection('clientGroups').insertMany(
        groupsEvents.map(event => ({
          _id: event.objId,
          createdAt: event.timestamp,
          updatedAt: event.timestamp,
          ...event.payload,
        }))
      )
    }

    if (data.clientGroupMeetings.length > 0) {
      console.log('Adding client group meetings')

      const meetingsEvents = data.clientGroupMeetings.map(
        clientGroupMeeting => ({
          type: 'create',
          obj: 'clientGroupMeeting',
          objId: clientGroupMeeting._id,
          payload: {
            ..._.omit(clientGroupMeeting, ['_id']),
          },
          timestamp: new Date(),
          importedAt,
          importId,
          importNotes,
        })
      )

      eventsToProcess.push(...meetingsEvents)

      await db.collection('events').insertMany(meetingsEvents)
      await db.collection('clientGroupsMeeting').insertMany(
        meetingsEvents.map(event => ({
          _id: event.objId,
          createdAt: event.timestamp,
          updatedAt: event.timestamp,
          ...event.payload,
        }))
      )
    }

    if (data.loanProducts.length > 0) {
      console.log('Adding loan products')

      const loanProductsEvents = _.uniqBy(data.loanProducts, 'name').map(
        loanProduct => ({
          type: 'create',
          obj: 'loanProduct',
          objId: loanProduct._id,
          payload: {
            ..._.omit(loanProduct, ['_id']),
          },
          timestamp: new Date(),
          importedAt,
          importId,
          importNotes,
        })
      )

      eventsToProcess.push(...loanProductsEvents)

      await db.collection('events').insertMany(loanProductsEvents)
      await db.collection('loanProducts').insertMany(
        loanProductsEvents.map(event => ({
          _id: event.objId,
          createdAt: event.timestamp,
          updatedAt: event.timestamp,
          ...event.payload,
        }))
      )
    }

    if (data.forms.length > 0) {
      console.log('Adding forms')

      const formsEvents = data.forms.map((form, index) => ({
        type: 'create',
        objId: form._id,
        obj: 'form',
        payload: {
          ..._.omit(form, ['_id', 'code']),
          code: ['F00', Number(Number(index) + 1)].join(''),
        },
        timestamp: new Date(),
        importedAt,
        importId,
        importNotes,
      }))

      eventsToProcess.push(...formsEvents)

      await db.collection('events').insertMany(formsEvents)
      await db.collection('forms').insertMany(
        formsEvents.map(event => ({
          _id: event.objId,
          createdAt: event.timestamp,
          updatedAt: event.timestamp,
          ...event.payload,
        }))
      )
    }

    if (data.loans.length > 0) {
      console.log('Adding loans')

      const loansEvents = data.loans.map(loan => ({
        type: 'create',
        objId: loan._id,
        obj: 'loan',
        payload: {
          ..._.omit(loan, ['_id']),
        },
        timestamp: new Date(),
        importedAt,
        importId,
        importNotes,
      }))

      eventsToProcess.push(...loansEvents)

      await db.collection('events').insertMany(loansEvents)
      await db.collection('loans').insertMany(
        loansEvents.map(event => ({
          _id: event.objId,
          createdAt: event.timestamp,
          updatedAt: event.timestamp,
          ...event.payload,
        }))
      )
    }

    if (data.securityBalances.length > 0) {
      console.log('Adding security transactions')

      const securityBalancesEvents = data.securityBalances.map(
        securityTransaction => ({
          type: 'create',
          objId: securityTransaction.clientId,
          obj: 'securityTransaction',
          payload: {
            ...securityTransaction,
          },
          timestamp: new Date(),
          importedAt,
          importId,
          importNotes,
        })
      )

      await db.collection('events').insertMany(securityBalancesEvents)
      await db.collection('securityBalances').insertMany(
        securityBalancesEvents.map(event => ({
          _id: event.payload.clientId,
          createdAt: event.timestamp,
          updatedAt: event.timestamp,
          ...event.payload,
        }))
      )
    }

    if (data.clientsToUpdate.length > 0) {
      console.log('Updating existing clients')
      const clientsEvents = data.clientsToUpdate.map(client => ({
        type: 'update',
        obj: 'client',
        objId: client._id,
        payload: {
          ..._.omit(client, ['_id']),
        },
        timestamp: new Date(),
        importedAt,
        importId,
        importNotes,
      }))

      await db.collection('events').insertMany(clientsEvents)

      await Promise.all(
        clientsEvents.map(event => {
          return db.collection('clients').updateOne(
            {
              _id: ObjectId(event.objId),
            },
            {
              $set: {
                ..._.omit(event.payload, ['_id', 'createdAt']),
                updatedAt: new Date(),
              },
            },
            {
              upsert: false,
            }
          )
        })
      )
    }

    if (data.settings.length > 0) {
      console.log('Adding settings')

      const settingsEvents = data.settings.map(setting => ({
        type: 'create',
        obj: 'setting',
        objId: setting._id,
        payload: {
          ..._.omit(setting, ['_id']),
        },
        timestamp: new Date(),
        importedAt,
        importId,
        importNotes,
      }))

      eventsToProcess.push(...settingsEvents)

      await db.collection('events').insertMany(settingsEvents)
      await db.collection('settings').insertMany(
        settingsEvents.map(event => ({
          _id: event.objId,
          createdAt: event.timestamp,
          updatedAt: event.timestamp,
          ...event.payload,
        }))
      )
    }

    if (data.holidays.length > 0) {
      console.log('Adding holidays')

      const holidaysEvents = data.holidays.map(holiday => ({
        type: 'create',
        obj: 'holiday',
        objId: holiday._id,
        payload: {
          ..._.omit(holiday, ['_id']),
        },
        timestamp: new Date(),
        importedAt,
        importId,
        importNotes,
      }))

      eventsToProcess.push(...holidaysEvents)

      await db.collection('events').insertMany(holidaysEvents)
      await db.collection('holidays').insertMany(
        holidaysEvents.map(event => ({
          _id: event.objId,
          createdAt: event.timestamp,
          updatedAt: event.timestamp,
          ...event.payload,
        }))
      )
    }

    console.log('Done.')
  } catch (error) {
    console.error(error)
  } finally {
    await disconnect()
  }
}

module.exports = {
  saveToMongo,
}
