import {Injectable} from '@angular/core';
import {IRecognizeSpeechResponse} from '../../interfaces';

@Injectable()
export class Api {

  recognizeSpeech (blob: Blob) : Promise<IRecognizeSpeechResponse> {
    return new Promise((resolve, reject) => {
      let xhr: XMLHttpRequest = new XMLHttpRequest();
      xhr.addEventListener("load",  (response: any) => {
        try {
          let json: IRecognizeSpeechResponse = JSON.parse(response.target.responseText);
          if (json.results && json.results.length) {
            resolve(json);
          }
          reject(new Error('Could not recognize speech.'));
        } catch (e) {
          reject(e);
        }
      });
      xhr.addEventListener("error", reject);
      xhr.open('POST', '/api/recognize-speech');
      xhr.setRequestHeader('Content-Type', 'audio/x-wav');
      xhr.send(blob);
    });
  }

}
