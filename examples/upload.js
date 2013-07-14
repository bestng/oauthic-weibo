//var client = require('weibo').client({ ... })
var form = require('form-data')()
var fs = require('fs')
//var file = '..........'

form.append('status', 'test file upload')
form.append('pic', fs.createReadStream(file), {
  filename: 'test.jpg'
, contentType: 'image/jpeg'
, knownLength: fs.statSync(file).size
})

form.pipe(client.post('/statuses/upload.json', {
  headers: form.getCustomHeaders()
}, function (err, res, body) {
  // ...
}))
