import { NgClass, NgFor } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';

@Component({
  selector: 'pagination',
  imports: [AngularSvgIconModule, NgFor, NgClass],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css',
})
export class paginationComponent {
  @Input() currentPage = 0;
  @Input() totalPages = 0;
  @Input() totalItems = 0;
  @Input() size = 10;
  @Output() pageChange = new EventEmitter<number>();
  @Output() sizeChange = new EventEmitter<number>();

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  getStartIndex(): number {
    return this.totalItems === 0 ? 0 : this.currentPage * this.size + 1;
  }

  getEndIndex(): number {
    const end = (this.currentPage + 1) * this.size;
    return end > this.totalItems ? this.totalItems : end;
  }
  
  onSizeChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const newSize = parseInt(target.value, 10);
    this.sizeChange.emit(newSize);
  }

  
getSelectableSizes(): number[] {
  return [5, 10, 20, 30, 50].filter(s => this.totalItems > s);
}

}
