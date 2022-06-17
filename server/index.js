const dotenv = require('dotenv')
dotenv.config()

const packageJson = require('./package.json')
const { ApolloServer, ApolloError } = require('apollo-server-fastify')
const { MongoClient, ObjectId } = require('mongodb')
const fastify = require('fastify')
const fastifyCors = require('fastify-cors')
const fastifyJwt = require('fastify-jwt')

const Sentry = require('@sentry/node')

const resolvers = require('./resolvers')
const typeDefs = require('./schema')

const Branches = require('./data-sources/Branches')
const CashAtHandForms = require('./data-sources/CashAtHandForms')
const ClientGroups = require('./data-sources/ClientGroups')
const ClientGroupsMeetings = require('./data-sources/ClientGroupsMeetings')
const Clients = require('./data-sources/Clients')
const Events = require('./data-sources/Events')
const Feedback = require('./data-sources/Feedback')
const Forms = require('./data-sources/Forms')
const Holidays = require('./data-sources/Holidays')
const LoanProducts = require('./data-sources/LoanProducts')
const Loans = require('./data-sources/Loans')
const Settings = require('./data-sources/Settings')
const Users = require('./data-sources/Users')

const { EventProcessor } = require('./eventProcessor')

const initAuth = require('./routes/initAuth')
const login = require('./routes/login')
const session = require('./routes/session')
const requestPasswordResetOTP = require('./routes/requestPasswordResetOTP')
const resetPassword = require('./routes/resetPassword')
const {
  loginSchema,
  resetPasswordSchema,
  requestPasswordResetSchema,
} = require('./utils/authRoutesJsonSchemas')

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT,

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 0.5,
})

const startApolloServer = async (client, typeDefs, resolvers) => {
  const dataSources = {
    branches: new Branches(client.db().collection('branches')),
    cashAtHandForms: new CashAtHandForms(
      client.db().collection('cashAtHandForms')
    ),
    clientGroups: new ClientGroups(client.db().collection('clientGroups')),
    clientGroupsMeetings: new ClientGroupsMeetings(
      client.db().collection('clientGroupsMeetings')
    ),
    clients: new Clients(client.db().collection('clients')),
    events: new Events(client.db().collection('events')),
    feedback: new Feedback(client.db().collection('feedback')),
    forms: new Forms(client.db().collection('forms')),
    holidays: new Holidays(client.db().collection('holidays')),
    loanProducts: new LoanProducts(client.db().collection('loanProducts')),
    loans: new Loans(client.db().collection('loans')),
    securityBalances: new Settings(client.db().collection('securityBalances')),
    settings: new Settings(client.db().collection('settings')),
    users: new Users(client.db().collection('users')),
  }

  const timezone = 'Africa/Kampala'
  const eventProcessor = new EventProcessor({
    dataSources,
    timezone,
    user: null,
    apiVersion: packageJson.version,
  })

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    persistedQueries: {
      ttl: null, // 5 seconds. Inspiration: https://github.com/cvburgess/SQLDataSource#caching--cache-ttl--
    },
    dataSources: () => dataSources,
    formatError: err => {
      console.error(err)
      if (process.env.NODE_ENV === 'production') {
        return new Error('Unknown Error')
      }

      return err
    },
    plugins: [
      {
        requestDidStart() {
          return {
            didEncounterErrors(ctx) {
              if (
                !['production', 'staging'].includes(
                  process.env.SENTRY_ENVIRONMENT
                )
              ) {
                console.error(ctx)
                return
              }
              if (!ctx.operation) {
                return
              }

              for (const err of ctx.errors) {
                if (err instanceof ApolloError) {
                  continue
                }

                // Add scoped report details and send to Sentry
                Sentry.withScope(scope => {
                  scope.setUser({
                    id: String(ctx.context.user._id),
                    fullPhoneNumber: ctx.context.user.fullPhoneNumber,
                    firstName: ctx.context.user.firstName,
                    lastName: ctx.context.user.lastName,
                  })

                  scope.setTag('kind', ctx.operation.operation)

                  scope.setExtra('query', ctx.request.query)
                  scope.setExtra('variables', ctx.request.variables)

                  if (err.path) {
                    scope.addBreadcrumb({
                      category: 'query-path',
                      message: err.path.join(' > '),
                      level: Sentry.Severity.Debug,
                    })
                  }

                  const transactionId =
                    ctx.request.http.headers.get('x-transaction-id')
                  if (transactionId) {
                    scope.setTransactionName(transactionId)
                  }

                  Sentry.captureException(err)
                })
              }
            },
            // async willSendResponse(requestContext2) {
            //   console.log('response data', requestContext2.response.data)
            // },
          }
        },
      },
    ],
    context: async ({ request, reply }) => {
      if (request.body.operationName !== 'IntrospectionQuery') {
        console.log('------------------------')
        console.log('q:', request.body.query)
        console.log('v:', request.body.variables)
        console.log('============================================')
      }

      if (!request.user) {
        reply.code(401).type('text/plain').send('Unauthenticated')
        return
      }

      const timezone = 'Africa/Kampala'

      const { userObject: user } = request

      const eventProcessor = new EventProcessor({
        dataSources,
        timezone,
        user,
        apiVersion: packageJson.version,
      })

      if (user) {
        return {
          eventProcessor,
          mongodb: client.db(),
          timezone,
          user,
        }
      }
    },
  })

  await server.start()

  const app = fastify({
    logger: false,
  })

  app.register(fastifyCors, {
    origin: (_, cb) => {
      cb(null, true)
      return
    },
  })

  app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET,
  })

  app.addHook('onRequest', async (request, reply) => {
    if (String(request.url).startsWith('/graphql')) {
      try {
        const token = await request.jwtVerify()

        try {
          const user = await client
            .db()
            .collection('users')
            .findOne({
              _id: ObjectId(token.user_data._id),
              isDisabled: { $ne: true },
            })

          if (!user || user.isDisabled) {
            return reply.code(401).type('text/plain').send('Unauthenticated')
          }

          request.userObject = user
        } catch (e) {
          console.error('Error finding user', e)
        }
      } catch (err) {
        reply.code(401).type('text/plain').send('Unauthenticated')
        return
      }
    }
  })

  app.decorate('eventProcessor', eventProcessor)

  app.post('/initAuth', async (request, reply) => {
    return initAuth(request, reply, client)
  })

  app.post('/login', { schema: loginSchema }, async (request, reply) => {
    return login(request, reply, client, app)
  })

  app.post(
    '/requestPasswordReset',
    { schema: requestPasswordResetSchema },
    async (request, reply) => {
      return requestPasswordResetOTP(request, reply, client, app)
    }
  )

  app.post(
    '/resetPassword',
    { schema: resetPasswordSchema },
    async (request, reply) => {
      return resetPassword(request, reply, client, app)
    }
  )

  app.post('/session', async (request, reply) => {
    return session(request, reply, client, app)
  })

  app.get('/healthcheck', (_, reply) => {
    reply.send({ ok: true })
  })

  app.register(server.createHandler({ cors: false }))

  await app.listen(4000)

  console.log(
    `🚀 Server ready at http://localhost:4000${server.graphqlPath} 🤓`
  )
}

async function main() {
  const client = await MongoClient.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })

  await startApolloServer(client, typeDefs, resolvers)
}

main()
