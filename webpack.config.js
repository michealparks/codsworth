const path = require('path')
const webpack = require('webpack')
const BabiliPlugin = require('babili-webpack-plugin')
const { version } = require('./package.json')

module.exports = {
  entry: {
    'index': './app/index',
    'offline-worker': './app/offline-worker'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  },
  output: {
    path: path.join(__dirname, 'public'),
    filename: '[name].js'
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      VERSION: `v${version}`,
      '__version__': version
    })
  ].concat(process.env.NODE_ENV === 'production' ? new BabiliPlugin() : [])
}
