const inline = require('inline-source')
const fs = require('fs')
const { resolve } = require('path')
const source = fs.createReadStream('app/index.html')
source.pipe(fs.createWriteStream('public/index.html'))
source.on('error', console.error.bind(console))
source.on('end', () => process.env.NODE_ENV === 'development'
  ? null : inline(resolve('app/index.html'), {
    compress: true,
    rootpath: resolve('public'),
    ignore: []
  }, (err, html) => err
    ? console.error(err)
    : fs.writeFile('public/index.html', html, 'utf-8', err => err
      ? console.error(err)
      : console.log('Inlined CSS and JS.')
    )
  )
)
