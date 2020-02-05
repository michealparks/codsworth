import commonjs from '@rollup/plugin-commonjs'
import replace from '@rollup/plugin-replace'
import resolve from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'

const DEV = process.env.NODE_ENV === 'development'

const plugins = [
  commonjs(),
  resolve(),
  replace({ DEV }),
  DEV ? undefined : terser()
]

module.exports = [{
  input: './app/main.js',
  output: {
    file: './dist/main.js',
    format: 'esm'
  },
  plugins: [
    ...plugins
  ]
}, {
  input: './electron/main.js',
  output: {
    file: './dist/electron.js',
    format: 'esm'
  },
  plugins: [
    ...plugins
  ]
}, {
  input: './electron/preload.js',
  output: {
    file: './dist/preload.js',
    format: 'esm'
  },
  plugins: [
    ...plugins
  ]
}]
