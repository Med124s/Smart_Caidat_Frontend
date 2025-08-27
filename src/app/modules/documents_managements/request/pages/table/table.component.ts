import { Component, EventEmitter, inject, OnInit, Output, signal } from '@angular/core';
import { ToastService } from 'src/app/shared/toast/toast.service';
import Swal from 'sweetalert2';
import { ArchiveDocumentComponent } from '../../../archive_document/pages/modal/archive-documents';
import { Archive } from '../../../archive_document/model/archive.model';
import { ArchiveSelectionService } from '../../../archive_document/pages/table/services/archive_docs-selection.service';
import { ArchiveService } from '../../../archive_document/pages/table/services/archive-docs.service';
import { TableRequestActionComponent } from './components/table-action/table-action.component';
import { TableRequestFooterComponent } from './components/table-footer/table-footer.component';
import { TableRequestHeaderComponent } from './components/table-header/table-header.component';
import { TableRequestRowComponent } from './components/table-row/table-row.component';

@Component({
  selector: 'app-archive-table',
  imports: [
    ArchiveDocumentComponent,
    TableRequestActionComponent,
    TableRequestFooterComponent,
    TableRequestHeaderComponent,
    TableRequestRowComponent,
  ],
  templateUrl: './table.component.html',
})
export class RequestTableComponent implements OnInit {
  // pagination
  searchPage = { page: 0, size: 5 };
  totalItems = signal(0);
  totalPages = signal(0);

  // data
  archives = signal<Archive[]>([]);
  filteredArchives = signal<Archive[]>([]);

  visiblearchivesIds = signal<string[]>([]);

  // flags
  loadingSearch = signal(false);
  showModalCreate = false;
  selectionService = inject(ArchiveSelectionService);
  // critères de recherche/filtrage
  filters = signal({
    title: '',
    type: '',
    status: '',
    categoryPublicId: '',
    startDate: '', // YYYY-MM-DD
    endDate: '', // YYYY-MM-DD
  });
  // service
  archiveService = inject(ArchiveService);
  toastService = inject(ToastService);

  // selectedIds: string[] = [];
  selectedIds = signal<string[]>([]); // ✅ signal pour IDs sélectionnés
  @Output() selectionChange = new EventEmitter<string[]>();
  selectedArchives: Archive[] = [];

  selectedArchive = signal<Archive | null>(null);
  showModal = false;
  modalMode: 'create' | 'edit' = 'create';
  originalDocuments = signal<Document[] | []>([]);
  modalVisible = false;

  onSearch(value: any) {
    // this.filters.set({ ...this.filters(), title: event });
    this.filters.set({ ...this.filters(), title: value ?? '' });
    this.applyFilters();
  }

  // date filters
  onStartDateChange(date: string) {
    this.filters.set({ ...this.filters(), startDate: date });

    this.applyFilters();
  }

  onEndDateChange(date: string) {
    this.filters.set({ ...this.filters(), endDate: date });
    this.applyFilters();
  }

  detailArchive(archive: any): void {
    const archiveCopy = { ...archive };

    this.selectedArchive.set(archiveCopy); // <-- le modal recevra cet objet
    this.originalDocuments.set([...(archive.documents || [])]); // snapshot à plat
    this.modalMode = 'edit';
    this.showModal = true;
  }

  showCreateModal(): void {
    this.selectedArchive.set(null);
    this.modalMode = 'create';
    this.showModal = true;
    console.log(this.showModal);
  }

  ngOnInit(): void {
    this.loadArchives();
  }

  onToggleSelect(archive: Archive) {
    if (this.selectedArchives.includes(archive)) {
      this.selectedArchives = this.selectedArchives.filter((a) => a !== archive);
    } else {
      this.selectedArchives.push(archive);
    }
  }

  onDeleteSelected(archivesToDelete: any[]) {
    // Consomer Api Delete here
    const ids = archivesToDelete;
    if (ids.length === 0) {
      Swal.fire({ text: 'Aucune archive sélectionnée', icon: 'warning' });
      return;
    }
    Swal.fire({
      title: `Voulez-vous supprimer ${ids.length} archive(s) ?`,
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
    }).then((result) => {
      if (result.isConfirmed) {
        this.archiveService.deleteArchivesBulk(ids).subscribe({
          next: () => {
            Swal.fire('Suppression réussie ✅');
            // Retirer les archives supprimées
            this.archives.update((list) => list.filter((a) => !ids.includes(a.publicId)));
            this.filteredArchives.update((list) => list.filter((a) => !ids.includes(a.publicId)));

            // Recalcul pagination
            const maxPage = Math.max(0, Math.ceil(this.filteredArchives().length / this.searchPage.size) - 1);
            if (this.searchPage.page > maxPage) this.searchPage.page = maxPage;

            this.updateVisibleArchives();
            this.selectionService.clearSelection();
            this.selectedArchives = [];
          },
          error: () => Swal.fire('Erreur lors de la suppression ❌'),
        });
      }
    });
  }

  /** Met à jour la page visible */
  updateVisibleArchives(): void {
    const start = this.searchPage.page * this.searchPage.size;
    const end = start + this.searchPage.size;
    const visible = (this.filteredArchives() || []).slice(start, end);
    this.visiblearchivesIds.set(visible.map((a) => a.publicId!));
  }

  /** Chargement initial */
  loadArchives(): void {
    this.archiveService.findAll(0, 1000).subscribe({
      next: (res: any) => {
        const archivesData = res?.value?.content || [];
        this.archives.set(archivesData);
        this.filteredArchives.set(archivesData);

        this.totalItems.set(archivesData.length);
        this.totalPages.set(Math.ceil(archivesData.length / this.searchPage.size));

        // Initialiser la page 0
        this.updateVisibleArchives();
      },
    });
  }

applyFilters(): void {
  // Base = la liste complète (toujours partir de la source "archives")
  const base = this.archives() || [];

  // Normaliser la recherche
  const search = (this.filters().title ?? '').toString().trim().toLowerCase();

  // 1) Appliquer la recherche texte (si vide => on reprend tout)
  let result = search ? base.filter((a: any) => {
    // protéger les champs inexistants
    const title = (a.title ?? '').toString().toLowerCase();
    const status = (a.status ?? '').toString().toLowerCase();
    const confidentiality = (a.confidentiality ?? '').toString().toLowerCase();
    const ownerType = (a.ownerType ?? '').toString().toLowerCase();
    const storage = (a.storageLocation ?? '').toString().toLowerCase();
    const categoryName  = (a.categoryName ?? '').toString().toLowerCase();

    return (
      title.includes(search) ||
      status.includes(search) ||
      confidentiality.includes(search) ||
      ownerType.includes(search) ||
      storage.includes(search) ||
      categoryName.includes(search)
    );
  }) : [...base]; // spread pour retourner une nouvelle référence

  // 2) Dates (si fournies)
  if (this.filters().startDate) {
    const start = this.filters().startDate;
    result = result.filter((a: any) => (a.creationDate ?? '') >= start);
  }
  if (this.filters().endDate) {
    const end = this.filters().endDate;
    result = result.filter((a: any) => (a.creationDate ?? '') <= end);
  }

  // 3) Status / catégorie
  if (this.filters().status) {
    result = result.filter((a: any) => a.status === this.filters().status);
  }
  if (this.filters().categoryPublicId) {
    result = result.filter((a: any) => a.categoryPublicId === this.filters().categoryPublicId);
  }

  console.log(result);
  
  // 4) Mise à jour du state
  this.filteredArchives.set(result);

  // Pagination recalculée
  this.totalItems.set(result.length);
  this.totalPages.set(Math.ceil(result.length / this.searchPage.size));

  // Reset page courante et recalcul visible
  this.searchPage.page = 0;
  this.updateVisibleArchives();
}

  // Affiche uniquement les archives de la page courante
  get visibleArchives(): Archive[] {
    const list = this.filteredArchives() ?? [];
    const start = this.searchPage.page * this.searchPage.size;
    const end = start + this.searchPage.size;
    return list.slice(start, end);
  }

  get visibleArchiveIds(): string[] {
    const archives = this.visibleArchives; // <-- pas filteredArchives direct
    if (!archives || archives.length === 0) return [];
    return archives.map((a) => a.publicId!);
    // return this.visibleArchives.map(a => a.publicId!);
  }

  get allFilteredArchiveIds(): string[] {
    return (this.filteredArchives() || []).map((a) => a.publicId!);
  }

  /** Gestion pagination */
  onPageChange(page: number): void {
    this.searchPage.page = page;
    this.updateVisibleArchives();
  }

  onSizeChange(size: number): void {
    this.searchPage.size = size;
    this.searchPage.page = 0; // reset
    this.updateVisibleArchives();
  }

  addArchive(archive: any) {
    this.archiveService.createArchive(archive, archive.documents, archive.storageLocation).subscribe({
      next: (createdState: any) => {
        console.log('BEFORE TEST');
        console.log(createdState);

        if (createdState?.status === 'OK' && createdState.value?.length) {
          // const newArchive = createdState.value; // ✅ extraire l'archive  return documents ajouter
          this.archives.update((list) => [archive, ...list]);
          // Optionnel : reset page pour que la nouvelle archive apparaisse
          // this.searchPage.page = 1;
          this.applyFilters();
          this.showModalCreate = false;
          this.toastService.show('Archive enregistrée avec succès ✅', 'SUCCESS');
        }
      },
      error: () => {
        this.toastService.show('Erreur lors de la création de l’archive ❌', 'DANGER');
      },
    });
  }

  trackDocumentsChanges(archive: Archive) {
    const originalDocs = this.originalDocuments() || []; // garder trace avant édition
    const currentDocs = archive.documents || [];
    const newDocs = currentDocs.filter((d) => !d.id); // pas encore enregistrés
    const removedDocs = originalDocs.filter((d: any) => !currentDocs.some((cd) => cd.id === d.id));
    const updatedDocs = currentDocs.filter(
      (d) => d.id && originalDocs.some((od: any) => od.id === d.id && JSON.stringify(od) !== JSON.stringify(d)),
    );
    return { newDocs, removedDocs, updatedDocs };
  }

  saveArchive(archive: Archive) {
    console.log('return to table ', archive);

    this.filteredArchives.update((list) => {
      const index = list.findIndex((a) => a.publicId === archive.publicId);
      if (index !== -1) {
        // mise à jour
        const newList = [...list];
        newList[index] = archive;
        return newList;
      } else {
        // création
        return [archive, ...list];
      }
    });
  }
}
