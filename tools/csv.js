const fs = require('fs')
const path = require('path')
const parse = require('csv-parse/lib/sync')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const { Signale } = require('signale')

const argv = yargs(hideBin(process.argv)).argv

const interactive = new Signale({ interactive: true, scope: 'tools' })

const readCsv = (
  fileName = '__________________________.csv',
  ignoreArgFilename = false
) => {
  const file = path.join(
    __dirname,
    'import-data',
    argv.file && !ignoreArgFilename ? argv.file.trim() : fileName
  )

  if (!fs.existsSync(file)) {
    console.log()
    interactive.error('File does not exist')
    console.log()
    process.exit(1)
  }

  interactive.info('Importing file', file)
  console.log()

  const rawCsv = fs.readFileSync(file).toString().trim()

  const csvArray = rawCsv.trim().split('\n')

  const headerLine = csvArray[0]
    .split(';')
    .map(column => column.toLowerCase().trim())
    .join(';')

  csvArray[0] = headerLine

  const rawRecords = JSON.parse(
    JSON.stringify(
      parse(csvArray.join('\n'), {
        columns: true,
        skipEmptyLines: true,
        delimiter: ';',
      })
    )
  )

  return {
    data: rawRecords,
    file: path.relative(
      __dirname,
      path.resolve(__dirname, argv.file ? argv.file.trim() : fileName)
    ),
  }
}

module.exports = {
  readCsv,
}
