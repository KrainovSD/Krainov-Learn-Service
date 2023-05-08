/** @type {import('next').NextConfig} */

const getAssetsConfig = () => ({
  test: /\.(jpg|jpeg|png|svg|gif|ico|eot|ttf|woff|woff2|mp4|pdf|webm)$/,
  type: 'asset',
  generator: {
    filename: 'static/assets/[name].[hash][ext]',
  },
})

const nextConfig = {
  reactStrictMode: true,
  hmr: false,
  images: {
    disableStaticImages: true,
  },
  webpack: (config) => {
    config.module.rules.push(getAssetsConfig())

    return config
  },
}

module.exports = nextConfig
