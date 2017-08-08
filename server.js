'use strict'

const express = require('express')
const morgan = require('morgan')
const app = express()

app.use(morgan('combined'))
app.use('/', express.static(require('path').join(__dirname, 'public')))

app.listen('2000', function () {
  console.log(`Server listening on port 2000`)
})
