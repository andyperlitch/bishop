import { Component } from '@angular/core';
let MediaStreamRecorder = require('msr');

const MAX_SECONDS_FOR_QUERY = 10;

@Component({
  selector: 'query-input',
  template: `
    <button
      type="button"
      class="query-button"
      (mousedown)="captureQuery()"
      (mouseup)="stopCapturing()">
      <i class="icon-mic"></i>
    </button>
  `,
  styles: [require('./query-input.component.scss')]
})
export class QueryInput {

  currentRecorder: any;
  currentStream: MediaStream;

  captureQuery() : void {

    let constraints : MediaStreamConstraints = {
      audio: true
    };

    navigator.mediaDevices.getUserMedia(constraints)
    .then(mediaStream => {
      this.currentStream = mediaStream;
      this.currentRecorder = new MediaStreamRecorder(mediaStream);
      this.currentRecorder.mimeType = 'audio/wav'; // check this line for audio/wav
      this.currentRecorder.ondataavailable = blob => this.sendRequest(blob);
      this.currentRecorder.start(MAX_SECONDS_FOR_QUERY * 1000);
    });
  }

  stopCapturing() : void {
    if (this.currentRecorder) {
      this.currentRecorder.stop();
      this.currentRecorder = null;
    }
    if (this.currentStream) {
      this.currentStream.stop();
    }
  }

  onCaptureSuccess(response: any) : void {
    console.log('success', response);
  }

  onCaptureError(response: any) : void {
    console.log('error', response);
  }

  private sendRequest(blob: Blob) : void {
    // POST/PUT "Blob" using FormData/XHR2
    let xhr: XMLHttpRequest = new XMLHttpRequest();
    // xhr.addEventListener("progress", updateProgress);
    xhr.addEventListener("load", this.onCaptureSuccess);
    xhr.addEventListener("error", this.onCaptureError);
    xhr.open('POST', '/api/recognize-speech');
    xhr.setRequestHeader('Content-Type', 'audio/x-wav');
    xhr.send(blob);
  }

}
