const axios = require('axios')
const yamrc = require('shared/yamrc')

const REALM_KEY = yamrc.secrets.REALM_KEY
const REALM_SECRET_KEY = yamrc.secrets.REALM_SECRET_KEY

async function main() {
  const loginResponse = await axios({
    method: 'post',
    url:
      'https://realm.mongodb.com/api/admin/v3.0/auth/providers/mongodb-cloud/login',
    data: {
      username: REALM_KEY,
      apiKey: REALM_SECRET_KEY,
    },
  })

  const { access_token: accessToken } = loginResponse.data

  const usersResponse = await axios({
    method: 'get',
    url: `https://realm.mongodb.com/api/admin/v3.0/groups/60192491c2e3007755738637/apps/${yamrc.currentRealmApp.appInternalId}/users`,
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  })

  const users = usersResponse.data

  for (let user of users) {
    await new Promise(r => setTimeout(r, 500))
    console.log('Deleting user', user)

    const delResponse = await axios({
      method: 'delete',
      url: `https://realm.mongodb.com/api/admin/v3.0/groups/60192491c2e3007755738637/apps/${yamrc.currentRealmApp.appInternalId}/users/${user._id}`,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    })

    console.log('Delete status', delResponse.status)
  }
}

main()
