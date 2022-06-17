const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const { Signale } = require('signale')
const chalk = require('chalk')
const yamrc = require('shared/yamrc')
const { getDatabaseConnection, disconnect } = require('./client')
const { readCsv } = require('./csv')
const { prepareData } = require('./prepareData')
const { saveToMongo } = require('./saveToMongo')

const argv = yargs(hideBin(process.argv)).argv

const interactive = new Signale({ interactive: true, scope: 'tools' })

async function main() {
  if (!argv.env) {
    console.log()
    interactive.error('Please specify --env <name>')
    console.log()
    process.exit(1)
  }

  if (
    yamrc.currentRealmApp.isProtected &&
    (!argv.force || argv.force.toLowerCase() !== 'imreallyreallysure')
  ) {
    console.log()
    interactive.error(
      'Please use --force=ImReallyReallySure in order to seed a protected environment'
    )
    console.log()
    process.exit(1)
  }

  const { data: rawRecords, file: dataFile } = readCsv()
  const { data: initialValues, file: initialValuesFile } = readCsv(
    './initial-values.csv',
    true
  )

  if (yamrc.currentRealmApp.isProtected) {
    console.log()
    console.log()
    console.log(chalk.bgRed('                                      '))
    console.log(chalk.bgRed('                                      '))
    console.log(chalk.bgRed('             DANGER ZONE              '))
    console.log(chalk.bgRed('                                      '))
    console.log(chalk.bgRed('                                      '))
    console.log()
    console.log()
    const msg = `Seeding protected environment ${argv.env} in %d`
    await new Promise(r => {
      interactive.await(msg, 5)
      setTimeout(() => {
        interactive.await(msg, 4)
        setTimeout(() => {
          interactive.await(msg, 3)
          setTimeout(() => {
            interactive.await(msg, 2)
            setTimeout(() => {
              interactive.await(msg, 1)
              setTimeout(() => {
                interactive.await(msg, 0)
                setTimeout(() => {
                  r()
                }, 1000)
              }, 1000)
            }, 1000)
          }, 1000)
        }, 1000)
      }, 1000)
    })
  }

  const db = await getDatabaseConnection(argv.env)

  const data = await prepareData(rawRecords, initialValues, db)
  const notes = [dataFile, initialValuesFile]
  if (argv.date) {
    notes.push(`--date: ${argv.date}`)
  }

  console.log('----------------------')
  console.log(
    data.users.reduce(
      (acc, user) => ({
        ...acc,
        [user.fullPhoneNumber.trim()]: 'placeholder',
      }),
      {}
    )
  )
  console.log('----------------------')

  await saveToMongo(data, db, notes)

  await disconnect()
}

main()
