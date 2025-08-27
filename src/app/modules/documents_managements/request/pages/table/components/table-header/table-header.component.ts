import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ArchiveSelectionService } from 'src/app/modules/documents_managements/archive_document/pages/table/services/archive_docs-selection.service';

@Component({
  selector: '[app-request-table-header]',
  imports: [AngularSvgIconModule],
  templateUrl: './table-header.component.html',
  styleUrl: './table-header.component.css',
})
export class TableRequestHeaderComponent {
  @Input() archiveIds: any[] = [];
  @Output() onCheck = new EventEmitter<boolean>();

  /** Observable qui renvoie true si tout est sélectionné */
  // isAllSelected$!: Observable<boolean>;
  private selectionService = inject(ArchiveSelectionService);

  toggleAllSelection(event: any) {
    const checked = event.target.checked;

    console.log('is checked');
    console.log(checked);

    if (checked) {
      console.log("selection ids::");
      this.selectionService.selectAll(this.archiveIds);
    } else this.selectionService.clearSelection();
    this.onCheck.emit(checked);
  }

  isAllSelected(): boolean {
    return this.archiveIds.length > 0 && this.archiveIds.every((id) => this.selectionService.isSelected(id));
  }
}
