const fs = require('fs')
const archiver = require('archiver')
const output = fs.createWriteStream(`${__dirname}/galeri.zip`)
const archive = archiver('zip', { zlib: { level: 9 } })

output.on('close', () => {
  console.log(archive.pointer() + ' total bytes')
  console.log('archiver has been finalized and the output file descriptor has closed.')
})

archive.on('warning', (err) => {
  if (err.code === 'ENOENT') {
    console.error(err)
  } else {
    throw err
  }
})

archive.on('error', (err) => {
  throw err
})

archive.directory('./', false)

archive.pipe(output)

archive.finalize()
