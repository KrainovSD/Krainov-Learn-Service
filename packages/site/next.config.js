const path = require('path')

const addAliases = (config) => ({
  ...config.resolve.alias,
  '~scss-ui-kit': path.resolve(__dirname, '../ui-kit/src/scss/index.scss'),
})

const getAssetsConfig = () => ({
  test: /\.(jpg|jpeg|png|svg|gif|ico|eot|ttf|woff|woff2|mp4|pdf|webm)$/,
  type: 'asset',
  generator: {
    filename: 'static/assets/[name].[hash][ext]',
  },
})

const nextConfig = {
  transpilePackages: ['@acme/ui', 'lodash-es'],
  output: 'standalone',
  images: {
    disableStaticImages: true,
  },

  webpack: (config, options) => {
    config.resolve.alias = addAliases(config)
    config.module.rules.push(getAssetsConfig())

    return config
  },
}

module.exports = nextConfig
