module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@assets': './assets',
            '@config': './config',
            '@constants': './constants',
            '@data': './data',
            '@screens': './components/screens',
            '@atoms': './components/atoms',
            '@molecules': './components/molecules',
            '@organisms': './components/organisms',
            '@navigation': './navigation',
            '@services': './services',
            '@providers': './providers',
            '@hooks': './hooks',
            '@utils': './utils',
            '@icons': './components/icons',
            '@images': './components/images',
          },
          extensions: ['.js', '.json'],
        },
      ],
    ],
  }
}
