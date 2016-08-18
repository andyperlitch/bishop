import { Component, Output, EventEmitter } from '@angular/core';
import {IQueryEvent} from '../interfaces/query-event';
import {IRecordingStartEvent, IRecognizeSpeechResponse} from '../interfaces';
import {Api} from '../services/api';

const MediaStreamRecorder = require('msr');
const MAX_SECONDS_FOR_QUERY = 10;

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

  @Output() start: EventEmitter<IRecordingStartEvent> = new EventEmitter<IRecordingStartEvent>();
  @Output() query: EventEmitter<IQueryEvent> = new EventEmitter<IQueryEvent>();

  private currentRecorder: any;
  private currentStream: MediaStream;
  private processingSpeech: boolean = false;

  constructor (private api: Api) {}

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

  onCaptureSuccess(response: IRecognizeSpeechResponse) : void {
    this.processingSpeech = false;
    this.query.emit({
      value: response.results[0].alternatives[0].transcript
    });
  }

  onCaptureError(response: any) : void {
    this.processingSpeech = false;
  }

  private sendRequest(blob: Blob) : void {
    this.api.recognizeSpeech(blob).then(
      (response: IRecognizeSpeechResponse) => { this.onCaptureSuccess(response); },
      (response: any) => { this.onCaptureError(response); }
    );
    this.processingSpeech = true;
  }

}
