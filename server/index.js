var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var recognizer = require('./recognizer');

// Get environment
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env' ) });


var app = express();
// app.use(function(req, res, next) {
//     var data = '';
//     req.setEncoding('utf8');
//     req.on('data', function(chunk) {
//         data += chunk;
//     });
//     req.on('end', function() {
//         req.rawBody = data;
//         next();
//     });
// });
// app.use(bodyParser());

app.post('/api/recognize-speech', function(req, res) {
  console.log('recognizing speech...');
  // var writer = fs.createWriteStream('./sample' + Math.random() + '.wav', { defaultEncoding: 'binary'  });
  // req.pipe(writer).on('end', function() {
  //   res.end();
  // });
  recognizer(req, function(err, result) {
    if (err) {
      res.status(400);
      res.send(JSON.stringify(err));
      console.log('error occurred: ', err);
      return;
    }
    console.log('success!', result);
    res.json(result);
  })
});

app.listen(process.env.SERVER_PORT);
console.log('Bishop API Server listening on port ' + process.env.SERVER_PORT);
