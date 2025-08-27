import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';

@Component({
  selector: '[app-table-header]',
  imports: [AngularSvgIconModule],
  templateUrl: './table-header.component.html',
  styleUrl: './table-header.component.css',
})
export class TableHeaderComponent {
  @Input() userIds: string[] = [];
  @Output() onCheck = new EventEmitter<boolean>();

  public toggle(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.onCheck.emit(checked); // émet au parent : true/false
  }
}
