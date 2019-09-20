const replace = require('rollup-plugin-replace')
const resolve = require('rollup-plugin-node-resolve')
const { terser } = require('rollup-plugin-terser')
const DEV = process.env.NODE_ENV === 'development'

module.exports = [{
  input: './app/main.js',
  output: {
    name: 'main.js',
    file: './main.js',
    format: 'esm'
  },
  plugins: [
    resolve({ mainFields: ['module', 'main'] }),
    replace({ DEV }),
    DEV ? undefined : terser()
  ]
}]
