// this file is being used by internal tools

const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const { Signale } = require('signale')

const argv = yargs(hideBin(process.argv)).argv

const interactive = new Signale({ interactive: true, scope: 'realm users' })

if (!argv.env && !process.env.REACT_APP_REALM_APP_ID) {
  console.log()
  interactive.error('Please specify --env <name>')
  console.log()
  process.exit(1)
}

module.exports = argv.env || process.env.REACT_APP_REALM_APP_ID
