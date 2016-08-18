import { Component, Output, EventEmitter } from '@angular/core';
let MediaStreamRecorder = require('msr');

const MAX_SECONDS_FOR_QUERY = 10;

export interface IQuery {
  value: string;
}

@Component({
  selector: 'query-input',
  template: `
    <button
      type="button"
      class="query-button"
      [ngClass]="{ processing: processingSpeech }"
      (mousedown)="captureQuery()"
      (mouseup)="stopCapturing()">
      <i class="icon-mic" *ngIf="!processingSpeech"></i>
      <div class="loader" *ngIf="processingSpeech"></div>
    </button>
  `,
  styles: [require('./query-input.component.scss')]
})
export class QueryInput {

  @Output() query: EventEmitter<IQuery> = new EventEmitter<IQuery>();
  currentRecorder: any;
  currentStream: MediaStream;
  processingSpeech: boolean = false;

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
    this.processingSpeech = false;
    try {
      let json: any = JSON.parse(response.target.responseText);
      this.query.emit({
        value: json.results[0].alternatives[0].transcript
      });
    } catch (e) {
      console.log('error with capturing query', e);
    }
  }

  onCaptureError(response: any) : void {
    console.log('error', response);
    this.processingSpeech = false;
  }

  private sendRequest(blob: Blob) : void {
    // POST/PUT "Blob" using FormData/XHR2
    let xhr: XMLHttpRequest = new XMLHttpRequest();
    // xhr.addEventListener("progress", updateProgress);
    xhr.addEventListener("load",  (response: any) => { this.onCaptureSuccess(response); });
    xhr.addEventListener("error", (response: any) => { this.onCaptureError(response); });
    xhr.open('POST', '/api/recognize-speech');
    xhr.setRequestHeader('Content-Type', 'audio/x-wav');
    xhr.send(blob);
    this.processingSpeech = true;
  }

}
