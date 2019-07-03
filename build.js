const rollup = require('rollup')
const nodeResolve = require('rollup-plugin-node-resolve')

const input = {
  input: './app/main.js',
  plugins: [nodeResolve()]
}

const output = {
  dir: './',
  format: 'iife'
}

const config = {
  ...input,
  output: [output]
}

async function build () {
  if (process.env.NODE_ENV === 'development') {
    const watcher = await rollup.watch(config)

    watcher.on('event', event => {
      if (event.code === 'BUNDLE_START') {
        console.log('compiling...')
      }

      if (event.code === 'BUNDLE_END') {
        console.log('compiled.')
      }

      if (event.code === 'ERROR') {
        console.error(event.error)
      }

      if (event.code === 'FATAL') {
        console.error(event.error)
        process.exit(1)
      }
    })
  } else {
    const bundle = await rollup.rollup(input)
    const res = await bundle.generate(config)
    await bundle.write(res.output)
  }
}

build()
