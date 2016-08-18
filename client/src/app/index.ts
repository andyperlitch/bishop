/// src/app/index.ts
import {Component} from '@angular/core';
import {FORM_PROVIDERS} from '@angular/common';

import '../style/app.scss';

import {QueryInput, IQuery} from './components/query-input.component';

import {Api} from './services/api';         // ./services/api/index.ts

/*
 * App Component
 * Top Level Component
 */
@Component({
    selector: 'app', // <app></app>
    providers: [...FORM_PROVIDERS, Api],
    directives: [QueryInput],
    pipes: [],
    styles: [
      require('./style.scss'),
      // HACK: webpack silently fails loading @font-face urls otherwise
      `@font-face {
        font-family: 'icomoon';
        src:  url('/fonts/icomoon.eot?j7sz78');
        src:  url('/fonts/icomoon.eot?j7sz78#iefix') format('embedded-opentype'),
          url('/fonts/icomoon.ttf?j7sz78') format('truetype'),
          url('/fonts/icomoon.woff?j7sz78') format('woff'),
          url('/fonts/icomoon.svg?j7sz78#icomoon') format('svg');
        font-weight: normal;
        font-style: normal;
      }`
    ],
    template: `
      <main>
        <h1 class="title">Bishop, at your service.</h1>
        <query-input (query)="onQuery($event)"></query-input>
        <p>{{ queryText }}</p>
      </main>
    `
})

export class App {

  queryText: string;

  onQuery (evt: IQuery) : void {
    this.queryText = evt.value;
  }
}
