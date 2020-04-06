import commonjs from '@rollup/plugin-commonjs'
import replace from '@rollup/plugin-replace'
import resolve from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'

const { DEV, PROD } = process.env

const plugins = [
  replace({ DEV, PROD }),
  PROD && terser()
]

module.exports = [{
  input: './app/main.js',
  output: {
    file: './dist/main.js',
    format: 'es'
  },
  plugins: [
    resolve(),
    ...plugins
  ]
}, {
  input: './electron/main.js',
  output: {
    file: './dist/electron.js',
    format: 'cjs'
  },
  plugins: [
    resolve({ preferBuiltins: true }),
    commonjs(),
    ...plugins
  ]
}, {
  input: './electron/preload.js',
  output: {
    file: './dist/preload.js',
    format: 'cjs'
  },
  plugins: [
    resolve({ preferBuiltins: false }),
    ...plugins
  ]
}]
