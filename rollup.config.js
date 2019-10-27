import replace from 'rollup-plugin-replace'
import resolve from 'rollup-plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'

const DEV = process.env.NODE_ENV === 'development'

module.exports = [{
  input: './app/main.js',
  output: {
    file: './dist/main.js',
    format: 'esm'
  },
  plugins: [
    resolve({ mainFields: ['module', 'main'] }),
    replace({ DEV }),
    DEV ? undefined : terser()
  ]
}, {
  input: './electron/main.js',
  output: {
    file: './dist/electron.js',
    format: 'esm'
  },
  plugins: [
    resolve(),
    replace({ DEV }),
    DEV ? undefined : terser()
  ]
}, {
  input: './electron/preload.js',
  output: {
    file: './dist/preload.js',
    format: 'esm'
  },
  plugins: [
    replace({ DEV }),
    DEV ? undefined : terser()
  ]
}]
