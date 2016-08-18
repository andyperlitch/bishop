/// src/app/index.ts
import {
  OnChanges,
  Component,
  EventEmitter,
  Output,
  Input,
  SimpleChanges
} from '@angular/core';
import {IQueryEvent} from '../interfaces';

@Component({
  selector: 'query-display',
  template: `
    <p>
      <em (click)="toggleEdit($event, editor)" [hidden]="editing || !query">
        "{{ query }}"
      </em>
      <input
        type="text"
        #editor
        [hidden]="!editing"
        (keyup)="onKeyUp($event)"
        (blur)="onBlur()"
        [(ngModel)]="editedValue"
      />
    </p>
    <p [hidden]="!editing" class="query-help-text">press enter or esc</p>
  `,
  styles: [`
    p {
      position: relative;
      width: 50%;
      text-align: center;
      margin: 10px auto 0;
    }
    input, em {
      display: block;
      padding: 10px;
      font-size: 110%;
      color: #888;
      width: 100%;
      text-align: center;
      font-style: italic;
      outline: none;
    }
    input[hidden], em[hidden] {
      display: none;
    }
    input {
      border: none;
      font-style: normal;
      background-color: transparent;
    }
    .query-help-text {
      font-size: 11px;
      color: #555;
    }
  `]
})
export class QueryDisplay implements OnChanges {

  @Input() query: string;
  @Output() update: EventEmitter<IQueryEvent> = new EventEmitter<IQueryEvent>();

  private editing: boolean = false;
  private editedValue: string;

  ngOnChanges (changes: SimpleChanges) : void {
    if (changes['query'].currentValue) {
      this.editedValue = changes['query'].currentValue.toString();
    }
  }

  toggleEdit(event: any = null, el: HTMLInputElement = null) : void {
    this.editing = !this.editing;
    if (this.editing && el != null) {
      setTimeout(() => {
        el.select();
      }, 0);
    }
  }

  onKeyUp(event: KeyboardEvent) : void {
    switch (event.keyCode) {
      case 13:
        this.toggleEdit();
        this.update.emit({ value: this.editedValue });
        this.query = this.editedValue;
      break;

      case 27:
        this.toggleEdit();
        this.editedValue = this.query;
      break;
    }
  }

  onBlur() : void {
    if (this.editing) {
      this.toggleEdit();
      this.editedValue = this.query;
    }
  }

}
