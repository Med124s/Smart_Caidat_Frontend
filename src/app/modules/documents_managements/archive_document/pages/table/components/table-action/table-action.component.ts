import { Component, EventEmitter, inject, Input, Output, Signal } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { Archive } from '../../../../model/archive.model';
import { ArchiveService } from '../../services/archive-docs.service';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { ArchiveSelectionService } from '../../services/archive_docs-selection.service';
import { TableFilterService } from '../../services/table-archive-services';

@Component({
  selector: 'app-archive-table-action',
  imports: [AngularSvgIconModule],
  templateUrl: './table-action.component.html',
  styleUrl: './table-action.component.css',
})
export class TableArchiveActionComponent {
  filterService = inject(TableFilterService);
  archiveService = inject(ArchiveService);
  selection = inject(ArchiveSelectionService);
  @Input() archiveResults!: Signal<Archive[]>; // 👈 signal
  @Input() updateArchiveResults!: (fn: (archives: Archive[]) => Archive[]) => void;
  @Input() size!: number;
  @Input() totalItems!: number;
  toastService = inject(ToastService);

  @Input() selectedIds!: string[];
  @Output() delete = new EventEmitter<void>();
  @Input() selectedArchives: Archive[] = [];
  @Output() deleteSelected = new EventEmitter<any[]>();
  @Output() search = new EventEmitter<string>();
  @Output() startDateChange = new EventEmitter<string>();
  @Output() endDateChange = new EventEmitter<string>();
  @Output() filter = new EventEmitter<any>(); // si tu veux un événement global pour tous les filtres

  filters: any = {
    title: '',
    startDate: '',
    endDate: '',
  };

  constructor() {}

  onSearchChange(value: Event) {
    const input = value.target as HTMLInputElement;
     this.filters.title = input.value;
    // console.log(input.value);
    this.search.emit( this.filters.title)
    this.filterService.searchField.set( this.filters.title);
  }

  onStartDateChange(event: any) {
    this.filters.startDate = event.target.value;
    this.startDateChange.emit(this.filters.startDate);
  }

  onEndDateChange(event: any) {
    this.filters.endDate = event.target.value;
    this.endDateChange.emit(this.filters.endDate);
  }
  deleteSelectedArchives() {
    console.log(this.selection.getSelectedIds());
    if (this.selection.getSelectedIds()) {
      this.deleteSelected.emit(this.selection.getSelectedIds());
    }
  }
}
