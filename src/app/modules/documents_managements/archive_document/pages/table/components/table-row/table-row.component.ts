import { AsyncPipe, DatePipe, NgClass, NgIf } from '@angular/common';
import { Component, EventEmitter, HostListener, inject, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import dayjs from 'dayjs';
import { Archive } from '../../../../model/archive.model';
import { ArchiveSelectionService } from '../../services/archive_docs-selection.service';
import { DocumentModalComponent } from '../../../modal/document_modal/documents-modal';
import { map, Observable } from 'rxjs';
import { ArchiveService } from '../../services/archive-docs.service';
import { ToastService } from 'src/app/shared/toast/toast.service';

@Component({
  selector: '[app-archive-table-row]',
  imports: [FormsModule, AngularSvgIconModule, DatePipe, DocumentModalComponent, AsyncPipe, NgClass, NgIf],
  templateUrl: './table-row.component.html',
  styleUrl: './table-row.component.css',
})
export class TableArchiveRowComponent implements OnInit {
  @Input() selectedArchives: Archive[] = [];

  @Input() archive!: Archive | any;
  @Input() archiveIds: string[] = [];
  @Output() onDeleteSelected = new EventEmitter<Archive[]>();
  @Output() detailArchive = new EventEmitter<Archive>();

  selection = inject(ArchiveSelectionService);
  selectionService = inject(ArchiveSelectionService);
  showDocumentsModal: boolean = false;
  archiveService = inject(ArchiveService);
  categories = [
    { id: 1, publicId: '3d47d76b-96ee-4d22-983d-aaedb16e1c6c', categoryName: 'Administration' },
    { id: 2, publicId: 'aceffc2b-c481-4c90-a14c-38b5620dc562', categoryName: 'Correspondance' },
    { id: 3, publicId: '3f57f4e3-758b-4a81-b9b3-dd7af13960ff', categoryName: 'collectivité territoriale' },
    { id: 4, publicId: '7b85090e-2767-4800-993f-39cc228b65d0', categoryName: 'préfecture' },
  ];
  //@Input() selectedIds: string[] = []; // ✅ ids sélectionnés envoyés du parent
  @Output() selectionChange = new EventEmitter<string>();
  isSelected$!: Observable<boolean>;
  selectedDocuments: Document[] = [];
  minioBaseUrl = 'https://minio.example.com/bucket-name/'; // ou dynamiquement
  toastService = inject(ToastService);
  ngOnInit(): void {
    this.isSelected$ = this.selectionService.selectedArchives$.pipe(
      map((set: Set<string>) => set.has(this.archive.publicId!)),
    );

    console.log("____________");
    console.log(this.archive);
    

  }

  @HostListener('click', ['$event'])
  onRowClick(event: MouseEvent) {
    // Si le clic vient d'un checkbox, on ignore
    if ((event.target as HTMLElement).closest('input[type="checkbox"]')) {
      return; // ne fait rien
    }
    // sinon, ouvre le modal
    this.detailArchive.emit(this.archive);
  }

  isSelected(): boolean {
    return this.selectionService.isSelected(this.archive.publicId!);
  }

  toggleSelection(event: Event) {
    event.stopPropagation();

    this.selectionService.toggleSelection(this.archive.publicId!);
    // optionnel : si tu veux notifier le parent à chaque sélection/désélection
    this.selectionChange.emit(this.archive.publicId);
  }
  formatLastSeen(value?: any): string {
    if (!value) return '';
    return dayjs(value).format('DD/MM/YYYY HH:mm');
  }

  openDocuments(archive: Archive, event: Event) {
    event.stopPropagation();
  if (!archive.publicId) return;

  this.archiveService.getDocumentsByArchive(archive.publicId).subscribe((state) => {
    if (state.status === 'INIT') {
      console.log("⏳ Chargement...");
    }

    if (state.error) {
      this.toastService.show('❌ Impossible de charger les documents', 'DANGER');
    }

    if (state.status === "OK" &&  state.value ) {
      this.selectedDocuments = state.value?.map((doc: any) => ({
        ...doc,
        fileUrl:
          doc.storageType === 'MINIO'
            ? `${this.minioBaseUrl}${doc.fileName}`
            : `assets/files/${doc.fileName}`,
      }));
      this.showDocumentsModal = true;
    }
  });
}



  closeDocuments() {
    this.showDocumentsModal = false;
  }

  getCategoryName(publicId: string): string {
    return this.categories.find((c) => c.publicId === publicId)?.categoryName || '';
  }
}
