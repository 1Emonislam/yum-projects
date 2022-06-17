const path = require('path')
const dotenv = require('dotenv')
const _ = require('lodash')
const twilio = require('twilio')

dotenv.config({ path: path.join(__dirname, '.env') })

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

const passwords = {}

async function main() {
  const batches = _.chunk(Object.entries(passwords), 10)

  for (let batch of batches) {
    console.log(batch)

    const output = await Promise.all(
      batch.map(([phoneNumber, password]) => {
        return client.messages.create({
          body: `Your new Yam password is: ${password}`,
          messagingServiceSid: process.env.TWILIO_SERVICE_SID,
          to: phoneNumber,
        })
      })
    )

    console.log(output)

    await new Promise(r => setTimeout(r, 3000))
  }
}

main()
