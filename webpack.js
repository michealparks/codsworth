const __dev__ = process.env.NODE_ENV === 'development'
const {join} = require('path')
const webpack = require('webpack')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const tasks = require('./tasks')

const uglify = new UglifyJsPlugin({
  parallel: true,
  uglifyOptions: {
    ecma: 6,
    warnings: true,
    compress: {
      drop_console: true,
      ecma: 6,
      keep_infinity: true,
      // removes unused top level functions
      // toplevel: true,
      passes: 1,
      // Some code runs faster in the Chrome V8 engine if this option is disabled
      reduce_funcs: false
    }
  }
})

const constants = {
  'process.env.NODE_ENV': JSON.stringify(__dev__ ? 'development' : 'production'),
  '__VERSION__': JSON.stringify(require('./package.json').version),
  '__dev__': __dev__
}

const config = {
  mode: __dev__ ? 'development' : 'production',
  devtool: false,
  entry: {
    'index': './app/index',
    'offline-worker': './app/offline-worker'
  },
  output: {
    path: join(__dirname, 'public'),
    filename: '[name].js'
  },
  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.DefinePlugin(constants)
  ].concat(__dev__ ? [] : uglify),
  node: {
    __dirname: false,
    __filename: false
  }
}

const pack = (config, watch) => {
  const compiler = webpack(config)

  if (watch) {
    compiler.watch({}, report)
  } else {
    compiler.run((err, stats) => err
      ? report(err)
      : report(null, stats))
  }
}

const report = (err, stats) => {
  if (err) console.error(err)
  if (stats) console.log(stats.toString({chunks: false, colors: true}))
  tasks()
}

if (__dev__) {
  pack(config, __dev__)
} else {
  pack(config, false)
}
