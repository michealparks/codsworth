const fs = require('fs')
const archiver = require('archiver')
const output = fs.createWriteStream(`${__dirname}/galeri.zip`)
const archive = archiver('zip', { zlib: { level: 9 } })

output.on('close', function () {
  console.log(archive.pointer() + ' total bytes')
  console.log('archiver has been finalized and the output file descriptor has closed.')
})

archive.on('warning', function (err) {
  if (err.code === 'ENOENT') {
    console.error(err)
  } else {
    throw err
  }
})

archive.on('error', function (err) {
  throw err
})

archive.pipe(output)

archive.finalize()
