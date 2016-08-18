var path = require('path');
var fs = require('fs');
var SoxCommand = require('sox-audio');
var google = require('googleapis');
var getAuthClient = require('./getAuthClient');
var speech = google.speech('v1beta1').speech;
var prepareSoxCommand = require('./prepareSoxCommand');

function recognizer(request, cb) {
  console.log('Requesting auth client...');
  getAuthClient(function(err, authClient) {
    if (err) {
      return cb(err);
    }

    // write request to temp wav file
    console.log('Writing tmp file...');
    var tmpBaseName = path.join(__dirname, 'tmp/sample' + Math.random());
    var tmpWavFileLocation = tmpBaseName + '.wav';
    var tmpRawFileLocation = tmpBaseName + '.raw';
    var writer = fs.createWriteStream(tmpWavFileLocation, { defaultEncoding: 'binary'  });
    request.pipe(writer);
    request.on('end', function() {

      // convert file to raw
      console.log('Converting wav file (' + tmpWavFileLocation + ') to raw (' + tmpRawFileLocation + ')...');

      // start [testing]
      // tmpWavFileLocation = path.join(__dirname, 'test/capital-of-germany.wav'); // what is the capital of germany
      // end [testing]

      var command = SoxCommand(tmpWavFileLocation)
      .output(tmpRawFileLocation)
      .outputEndian('little')
      .outputSampleRate(16000)
      .outputEncoding('signed-integer')
      .outputBits(16)
      .outputChannels(1)
      .outputFileType('raw');

      prepareSoxCommand(command);
      command.on('error', function(err, stdout, stderr) {
        cb(err);
    	});
      command.on('end', function() {
        // read converted file and send request to google
        fs.readFile(tmpRawFileLocation, function (err, audioFile) {
          if (err) {
            return cb(err);
          }
          console.log('Got audio file: ', tmpRawFileLocation);
          var encoded = new Buffer(audioFile).toString('base64');
          var payload = {
            config: {
              encoding: 'LINEAR16',
              sampleRate: 16000
            },
            audio: {
              content: encoded
            }
          };
          console.log('Sending request to google...');
          speech.syncrecognize({
            auth: authClient,
            resource: payload
          }, function (err, result) {
            if (err) {
              return cb(err);
            }
            console.log('result:', JSON.stringify(result, null, 2));
            cb(null, result);
          });
        });
      });

      command.run();

      // delete temp file
    })
    .on('error', cb);
  });
}

exports = module.exports = recognizer;
