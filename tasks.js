const {createReadStream, createWriteStream, writeFile} = require('fs')
const {resolve} = require('path')
const {inlineSource} = require('inline-source')
const source = createReadStream('app/index.html')

module.exports = () => {
  console.log('Inlining CSS and JS')

  source.pipe(createWriteStream('public/index.html'))

  source.on('error', (err) => console.error(err))

  source.on('end', async () => {
    const html = await inlineSource(resolve('app/index.html'), {
      compress: false,
      rootpath: resolve(__dirname, 'public')
    })

    writeFile('public/index.html', html, 'utf-8', err => err
      ? console.error(err)
      : console.log('Inlined CSS and JS.')
    )
  })
}
