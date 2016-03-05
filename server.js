var R = require('ramda')
var fs = require('fs')
var glob = require('glob')
var express = require('express')
var app = express()

app.use('/', express.static('../frontend'))

var tracks = []
var grouped = {}

glob.glob('../scadm2/pending/*.meta.json', function (err, files) {
  if (err) {
    console.log('failed reading files')
    console.error(err)
    process.exit(-1)
  }

  // parse contents, make into large array
  tracks = R.map(function (filename) {
    console.log('processing: ', filename)
    var contents = fs.readFileSync(filename)
    var metadata = JSON.parse(contents)
    return metadata
  }, files)

  grouped = R.pipe(
    // group by user id
    R.groupBy(R.path(['user', 'permalink'])),
    // create a 'toplevel' user object, by picking it from the tracks
    R.map(function (user_tracks) {
      return {
        tracks: user_tracks,
        user: R.head(user_tracks).user
      }
    })
  )(tracks)

  console.log('try localhost:3000/')
})

// serve the array
app.get('/all-tracks', function (req, res) {
  res.json(tracks)
})

app.get('/users', function (req, res) {
  var users = R.keys(grouped)
  var user_with_count = R.map(function (username) {
    return {
      user_id: username,
      track_count: grouped[username].tracks.length
    }
  }, users)

  res.json(user_with_count)
})

app.get('/tracks-from-user/:user_id', function (req, res) {
  var user_id = req.params.user_id

  if (R.has(user_id, grouped)) {
    res.json(grouped[user_id])
  } else {
    res.json([])
  }
})

app.get('/grouped-by-user', function (req, res) {
  res.json(grouped)
})

app.listen(3000)
