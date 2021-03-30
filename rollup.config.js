import commonjs from '@rollup/plugin-commonjs'
import replace from '@rollup/plugin-replace'
import resolve from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'

const { DEV, PROD } = process.env

const plugins = [
  commonjs(),
  replace({ DEV, PROD, preventAssignment: true }),
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
}]
