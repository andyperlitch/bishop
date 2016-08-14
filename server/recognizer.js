var wav = require('wav');
var through2 = require('through2');
var SoxCommand = require('sox-audio');
var google = require('googleapis');
var getAuthClient = require('./getAuthClient');
var speech = google.speech('v1beta1').speech;

var addStandardListeners = function(command) {
	command.on('prepare', function(args) {
		console.log('Preparing sox command with args ' + args.join(' '));
	});

	command.on('start', function(commandLine) {
		console.log('Spawned sox with command ' + commandLine);
	});

	command.on('progress', function(progress) {
	    console.log('Processing progress: ', progress);
	});

	command.on('error', function(err, stdout, stderr) {
	    console.log('Cannot process audio: ' + err.message);
	    console.log('Sox Command Stdout: ', stdout);
	    console.log('Sox Command Stderr: ', stderr)
	});

	command.on('end', function() {
	    console.log('Sox command succeeded!');
	});
};

function recognizer(request, cb) {
  getAuthClient(function(err, authClient) {
    if (err) {
      return cb(err);
    }

    // Create a readable stream from wav
    var reader = new wav.Reader();

    // Create sox command and output stream
    var soxOutput = through2(function(chunk, enc, callback) {
      this.push(chunk);
      console.log('pushing chunk...');
      callback();
    });
    var command = SoxCommand()
      .input(reader)
      .inputFileType('wav')
      .output(soxOutput)
      .outputEncoding('signed-integer')
      .outputBits(16)
      .outputChannels(1)
      .outputFileType('raw');
    addStandardListeners(command);

    // Set the listener on the format
    reader.on('format', function(f) {

      console.log('Creating sox output stream...');
      console.log(f);
      var data;
      var format = f;
      command
        .inputSampleRate(f.sampleRate)
        .inputBits(f.bitDepth)
        .inputChannels(f.channels)

      soxOutput.on('data', function(chunk) {
        console.log('data received on soxOutput...');
        if (data) {
          data = Buffer.concat([data, chunk]);
        }
        else {
          data = chunk;
        }
      });

      soxOutput.on('end', function() {
        console.log('Sox output stream ended', data instanceof Buffer);
        var requestPayload = {
          config: {
            encoding: 'LINEAR16',
            sampleRate: format.sampleRate
          },
          audio: {
            content: data.toString('base64')
          }
        };

        speech.syncrecognize({
            auth: authClient,
            resource: requestPayload
          }, function (err, result) {
            if (err) {
              return cb(err);
            }
            console.log('result:', JSON.stringify(result, null, 2));
            cb(null, result);
          });
      });

      command.run();

    });

    // Pipe request to the reader
    console.log('Reading command and piping input...');

    request.pipe(reader).pipe(soxOutput);

  });
}

exports = module.exports = recognizer;
