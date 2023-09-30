const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: process.env.NODE_ENV === 'production' ? '/hansca/' : '/',
  devServer: {
    // HTTPS is required for WebNFC to work when testing on a real device
    // https: true,
  }
})
