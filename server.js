var R = require('ramda')
var fs = require('fs')
var glob = require('glob')
var express = require('express')
var app = express()

app.use('/', express.static('../frontend'))

var data = []

glob.glob('../scadm2/pending/*.meta.json', function (err, files) {
  if (err) {
    console.log('failed reading files')
    console.error(err)
    process.exit(-1)
  }

  // parse contents, make into large array
  data = R.map(function (filename) {
    console.log(filename)
    var contents = fs.readFileSync(filename)
    var metadata = JSON.parse(contents)
    return metadata
  }, files)
})

// serve the array
app.get('/data.json', function (req, res) {
  res.json(data)
})

app.listen(3000)
