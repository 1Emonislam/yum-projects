// const axios = require('axios')
// const yamrc = require('shared/yamrc')

// const REALM_KEY = yamrc.secrets.REALM_KEY
// const REALM_SECRET_KEY = yamrc.secrets.REALM_SECRET_KEY

async function getRealmUsersIds() {
  return {}
  // const loginResponse = await axios({
  //   method: 'post',
  //   url:
  //     'https://realm.mongodb.com/api/admin/v3.0/auth/providers/mongodb-cloud/login',
  //   data: {
  //     username: REALM_KEY,
  //     apiKey: REALM_SECRET_KEY,
  //   },
  // })

  // const { access_token: accessToken } = loginResponse.data

  // const usersResponse = await axios({
  //   method: 'get',
  //   url: `https://realm.mongodb.com/api/admin/v3.0/groups/60192491c2e3007755738637/apps/${yamrc.currentRealmApp.appInternalId}/users`,
  //   headers: {
  //     authorization: `Bearer ${accessToken}`,
  //   },
  // })

  // const users = usersResponse.data

  // return users.reduce((result, user) => {
  //   const identity = user.identities.find(
  //     identity => identity.provider_type === 'custom-function'
  //   )

  //   return {
  //     ...result,
  //     [identity.id]: user._id,
  //     [user.data.name]: user._id,
  //   }
  // }, {})
}

module.exports = {
  getRealmUsersIds,
}
