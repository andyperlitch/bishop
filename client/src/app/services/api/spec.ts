import {
  it,
  fit,
  describe,
  ddescribe,
  expect,
  inject,
  beforeEachProviders
} from '@angular/core/testing';
import {Api} from './index';

describe('Api Service', () => {

  beforeEachProviders(() => [Api]);

  // describe('recognizeSpeech method', () => {
  //   it('should return a promise', inject([Api], (api:Api) => {
  //     expect(api.recognizeSpeech).toBe('Angular 2');
  //   }));
  // });



});
