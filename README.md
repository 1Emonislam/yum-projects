# Yam monorepo

There are a couple of custom solutions in order to make working with the codebase and Yam stack easier, mostly due to the tech debt from MongoDB Realm.
One of them is using environments defined in `shared/yamrc.js` where we keep references to production, staging and dev environments.
Currently both web and mobile apps support connecting with local (or any) backend, so there's no need to refer to env (Realm App ID) in these apps, however running them still depends on it.
Feel free to use your own local MongoDB instance or connect to the main one (for now).

# Setting up an Environment

1. Run `yarn` in the root directory of the repo

1. Set up your `server/.env` file (get someone to help you)

1. Set up your `shared/yamsecrets.js` file and make sure `shared/yamrc.js` looks good (these are legacy files from times when we were using MongoDB Realm)

## Backend

```sh
yarn start:server # or cd server && yarn start
```

## Mobile

There are a couple of useful NPM scripts:

Start Expo

```sh
yarn start:mobile --env <your env name>
```

Start Expo and Android emulator

```sh
yarn android --env <your env name>
```

## Web

```sh
yarn start:web --env <your env name>
```

# Running tests and building

```sh
yarn test
```

Should run all tests in the workspace.

# Building and deploying

## Backend

TBD

## Mobile

TBD

## Web

Builds are handled automatically by Netlify on dev and master branches.
# yam-projects
