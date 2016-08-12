var google = require('googleapis');
var getAuthClient = require('./getAuthClient');
var speech = google.speech('v1beta1').speech;
function recognizer(request, cb) {
  getAuthClient(function(err, authClient) {
    if (err) {
      return cb(err);
    }
    var requestPayload = {
      config: {
        encoding: 'LINEAR16',
        sampleRate: 44100
      },
      audio: {
        content: request.rawBody.toString('base64')
      }
    };

    speech.syncrecognize({
        auth: authClient,
        resource: requestPayload
      }, function (err, result) {
        if (err) {
          // console.log('error: ', err);
          debugger;
          return cb(err);
        }
        console.log('result:', JSON.stringify(result, null, 2));
        cb(null, result);
      });
  });
}

exports = module.exports = recognizer;
