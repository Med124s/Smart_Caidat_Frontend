import { Component, inject, OnInit, signal } from '@angular/core';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { TableRequestActionComponent } from './components/table-action/table-action.component';
import { TableRequestFooterComponent } from './components/table-footer/table-footer.component';
import { TableRequestHeaderComponent } from './components/table-header/table-header.component';
import { TableRequestRowComponent } from './components/table-row/table-row.component';
import { RequestDocumentComponent } from '../modal/request-documents';
import { RequestDocument, RequestStatus } from '../../model/request.model';
import { RequestService } from './services/request-docs.service';
import { State } from 'src/app/shared/models/state.model';
import { SearchResponse } from '../../model/request-search';
import { Pagination } from 'src/app/shared/models/request.model';
import { ConnectedUser } from 'src/app/shared/models/user.model';
import { Oauth2AuthService } from 'src/app/modules/auth/oauth2-auth.service';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-request-table',
  imports: [
    RequestDocumentComponent,
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
  currentUser: ConnectedUser | null = null;

  // données
  requests = signal<RequestDocument[]>([]);
  filteredRequests = signal<RequestDocument[]>([]);
  visibleRequestIds = signal<string[]>([]);

  // modal
  selectedRequest = signal<RequestDocument | null>(null);
  showModal = false;
  modalMode: 'create' | 'edit' = 'create';

  // sélection
  selectedRequests: RequestDocument[] = [];

  // service
  requestService = inject(RequestService);
  toastService = inject(ToastService);

  loadingSearch = signal(false);
  filters = signal({
    title: '',
    type: '',
    status: '',
    startDate: '',
    endDate: '',
  });

  selectedIds = signal<string[]>([]);
  oauth2Auth = inject(Oauth2AuthService);

  ngOnInit(): void {
    this.loadRequests();
    const state: State<ConnectedUser> = this.oauth2Auth.fetchUser();
    if (state.status === 'OK' && state.value) {
      this.currentUser = state.value;
    }
  }

  /** ==================== LOAD ==================== */
  pagination: Pagination = {
    page: 0,
    size: 10000,
    sort: ['creationDate,desc'], // tri par date de création décroissante,
  };
  loadRequests(): void {
    this.loadingSearch.set(true);
    this.requestService.search('', this.pagination).subscribe((state: State<SearchResponse<RequestDocument>>) => {
      if (state.status === 'OK' && state.value) {
        console.log('___________requests__________________');
        console.log(state?.value['data']);

        this.requests.set(state.value?.data);
        this.filteredRequests.set(state.value.data);
        this.totalItems.set(state.value.totalItems);
        this.totalPages.set(state.value.totalPages);
        this.updateVisibleRequests();
      } else if (state.status === 'ERROR') {
        this.toastService.show('Erreur lors du chargement des demandes ❌', 'DANGER');
      }
      this.loadingSearch.set(false);
    });
  }

  /** ==================== FILTER ==================== */
  applyFilters(): void {
    const base = this.requests() || [];
    const { title, type, status, startDate, endDate } = this.filters();

    let result = [...base];

    if (title) {
      const search = title.toLowerCase();
      result = result.filter(
        (r) => (r.type ?? '').toLowerCase().includes(search) || (r.description ?? '').toLowerCase().includes(search),
      );
    }

    if (type) result = result.filter((r) => r.type === type);
    if (status) result = result.filter((r) => r.status === status);

    if (startDate) result = result.filter((r) => (r.creationDate ?? '') >= startDate);
    if (endDate) result = result.filter((r) => (r.creationDate ?? '') <= endDate);

    this.filteredRequests.set(result);

    // pagination
    this.totalItems.set(result.length);
    this.totalPages.set(Math.ceil(result.length / this.searchPage.size));
    this.searchPage.page = 0;
    this.updateVisibleRequests();
  }

  /** ==================== VISIBLE ==================== */
  updateVisibleRequests(): void {
    const list = this.filteredRequests() ?? [];
    const start = this.searchPage.page * this.searchPage.size;
    const end = start + this.searchPage.size;
    const visible = list.slice(start, end);
    this.visibleRequestIds.set(visible.map((a) => a.publicId!));
  }

  /** ==================== MODAL ==================== */
  showCreateModal(): void {
    this.selectedRequest.set(null);
    this.modalMode = 'create';
    this.showModal = true;
  }

  detailRequest(request: RequestDocument): void {
    this.selectedRequest.set(request);
    this.modalMode = 'edit';
    this.showModal = true;
  }

  handleStatusUpdate(event: { request: RequestDocument; newStatus: RequestStatus }) {
    const { request, newStatus } = event;
    if (!request.publicId || !this.currentUser) return;

    this.requestService.updateStatus(request.publicId, newStatus, this.currentUser.publicId!).subscribe((state) => {
      console.log('_________ state value ___________');
      console.log(state);

      if (state.status === 'INIT') {
        console.log('LOADING');
      } else if (state.status === 'OK' && state.value) {
        // تحديث local array directement
        request.status = state.value.status;
        request.validatorPublicId = state.value.validatorPublicId;
        request.validationDate = state.value.validationDate;
        this.toastService.show(`✅ Statut mis à jour: ${newStatus}`, 'SUCCESS');

        // ✅ Si c'est approuvé, générer le PDF
        if (newStatus === RequestStatus.APPROVED) {
          this.generateAndUploadPDF(request);
        }
      } else {
        this.toastService.show('❌ Erreur lors du changement de statut', 'DANGER');
        console.error('Erreur:', state.error);
      }
    });
  }
  async generateAndUploadPDF(request: RequestDocument) {
    try {
      // 1️⃣ Génération du PDF (par exemple avec jsPDF)
      const doc = new jsPDF();
      doc.text(`Certificat de la demande ${request.publicId}`, 10, 10);
      const pdfBlob = doc.output('blob');

      // 2️⃣ Upload vers le backend / MinIO
      this.requestService.uploadCertificate(request.publicId!, pdfBlob).subscribe({
        next: () => this.toastService.show('PDF généré et uploadé ✅', 'SUCCESS'),
        error: () => this.toastService.show('Erreur lors de l’upload du PDF ❌', 'DANGER'),
      });
    } catch (error) {
      console.error(error);
      this.toastService.show('Erreur lors de la génération du PDF ❌', 'DANGER');
    }
  }

  /** ==================== SAVE / ADD ==================== */
  saveRequest(request: RequestDocument) {
    console.log('___________ save request');
    console.log(request);

    this.filteredRequests.update((list) => {
      const index = list.findIndex((a) => a.publicId === request.publicId);
      if (index !== -1) {
        // mise à jour
        const newList = [...list];
        newList[index] = request;
        return newList;
      } else {
        // création
        console.log('_______________ CREATE _____________');

        return [request, ...list];
      }
    });
  }

  // // Mise à jour ou création
  // if (this.modalMode === 'create') {

  //   this.requestService.create(request).subscribe((state: State<RequestDocument>) => {
  //     if (state.status === 'OK' && state.value) {
  //       this.requests.update(list => [state.value!, ...list]);
  //       this.filteredRequests.update(list => [state.value!, ...list]);
  //       this.toastService.show('Demande créée avec succès ✅', 'SUCCESS');
  //     } else {
  //       this.toastService.show('Erreur lors de la création ❌', 'DANGER');
  //     }
  //   });
  // } else {
  //   this.requestService.update(request).subscribe((state: State<RequestDocument>) => {
  //     if (state.status === 'OK' && state.value) {
  //       this.requests.update(list => list.map(r => r.publicId === state.value!.publicId ? state.value! : r));
  //       this.filteredRequests.update(list => list.map(r => r.publicId === state.value!.publicId ? state.value! : r));
  //       this.toastService.show('Demande mise à jour avec succès ✅', 'SUCCESS');
  //     } else {
  //       this.toastService.show('Erreur lors de la mise à jour ❌', 'DANGER');
  //     }
  //   });
  // }

  /** ==================== DELETE ==================== */
  onDeleteSelected(selectedIds: any[]) {
    if (selectedIds.length === 0) {
      this.toastService.show('Aucune demande sélectionnée', 'DANGER');
      return;
    }
    this.requestService.delete(selectedIds).subscribe((state: State<string[]>) => {
      if (state.status === 'OK' && state.value) {
        this.requests.update((list) => list.filter((r) => !state.value!.includes(r.publicId!)));
        this.filteredRequests.update((list) => list.filter((r) => !state.value!.includes(r.publicId!)));
        this.toastService.show('Demandes supprimées ✅', 'SUCCESS');
        this.updateVisibleRequests();
      } else {
        this.toastService.show('Erreur lors de la suppression ❌', 'DANGER');
      }
    });
  }

  /** ==================== PAGINATION ==================== */
  onPageChange(page: number) {
    this.searchPage.page = page;
    this.updateVisibleRequests();
  }

  onSizeChange(size: number) {
    this.searchPage.size = size;
    this.searchPage.page = 0;
    this.updateVisibleRequests();
  }

  visibleRequestsIds = signal<string[]>([]);

  // Affiche uniquement les archives de la page courante
  get visibleRequests(): RequestDocument[] {
    const list = this.filteredRequests() ?? [];
    const start = this.searchPage.page * this.searchPage.size;
    const end = start + this.searchPage.size;
    return list.slice(start, end);
  }

  // get visibleRequestIds(): string[] {
  //   // const archives = this.visibleArchives; // <-- pas filteredArchives direct
  //   // if (!archives || archives.length === 0) return [];
  //   // return archives.map((a) => a.publicId!);
  //   return [];
  // }

  get allFilteredArchiveIds(): string[] {
    // return (this.filteredArchives() || []).map((a) => a.publicId!);
    return [];
  }

  onSearch(value: any) {
    // this.filters.set({ ...this.filters(), title: event });
    this.filters.set({ ...this.filters(), title: value ?? '' });
    this.applyFilters();
  }

  //   // date filters
  onStartDateChange(date: string) {
    this.filters.set({ ...this.filters(), startDate: date });
    this.applyFilters();
  }

  onEndDateChange(date: string) {
    this.filters.set({ ...this.filters(), endDate: date });
    this.applyFilters();
  }

  // pagination
  //   searchPage = { page: 0, size: 5 };
  //   totalItems = signal(0);
  //   totalPages = signal(0);

  //   // data
  //   requests = signal<RequestDocument[]>([]);
  //   filteredRequestDocuments = signal<RequestDocument[]>([]);

  //   visibleRequestsIds = signal<string[]>([]);

  //   // flags
  //   loadingSearch = signal(false);
  //   showModalCreate = false;
  //   selectionService = inject(RequestSelectionService);
  //   // critères de recherche/filtrage
  //   filters = signal({
  //     title: '',
  //     type: '',
  //     status: '',
  //     categoryPublicId: '',
  //     startDate: '', // YYYY-MM-DD
  //     endDate: '', // YYYY-MM-DD
  //   });
  //   // service
  //   requestService = inject(RequestService);
  //   toastService = inject(ToastService);

  //   // selectedIds: string[] = [];
  //   selectedIds = signal<string[]>([]); // ✅ signal pour IDs sélectionnés
  //   @Output() selectionChange = new EventEmitter<string[]>();
  //   selectedRequests: RequestDocument[] = [];
  //   selectedRequest = signal<RequestDocument | null>(null);
  //   showModal = false;
  //   modalMode: 'create' | 'edit' = 'create';
  //   originalDocuments = signal<Document[] | []>([]);
  //   modalVisible = false;

  //   onSearch(value: any) {
  //     // this.filters.set({ ...this.filters(), title: event });
  //     this.filters.set({ ...this.filters(), title: value ?? '' });
  //     this.applyFilters();
  //   }

  //   // date filters
  //   onStartDateChange(date: string) {
  //     this.filters.set({ ...this.filters(), startDate: date });

  //     this.applyFilters();
  //   }

  //   onEndDateChange(date: string) {
  //     this.filters.set({ ...this.filters(), endDate: date });
  //     this.applyFilters();
  //   }

  //   detailRequest(request: any): void {
  //     // const archiveCopy = { ...archive };

  //     // this.selectedRequest.set(archiveCopy); // <-- le modal recevra cet objet
  //     // this.originalDocuments.set([...(archive.documents || [])]); // snapshot à plat
  //     // this.modalMode = 'edit';
  //     // this.showModal = true;
  //   }

  //   showCreateModal(): void {
  //     this.selectedRequest.set(null);
  //     this.modalMode = 'create';
  //     this.showModal = true;
  //     console.log(this.showModal);
  //   }

  //   ngOnInit(): void {
  //     this.loadRequests();
  //   }

  //   onToggleSelect(request: RequestDocument) {
  //     // if (this.selectedRequests.includes(archive)) {
  //     //   this.selectedRequests = this.selectedRequests.filter((a) => a !== archive);
  //     // } else {
  //     //   this.selectedRequests.push(archive);
  //     // }
  //   }

  //   onDeleteSelected(requestsToDelete: any[]) {
  //     // // Consomer Api Delete here
  //     // const ids = archivesToDelete;
  //     // if (ids.length === 0) {
  //     //   Swal.fire({ text: 'Aucune archive sélectionnée', icon: 'warning' });
  //     //   return;
  //     // }
  //     // Swal.fire({
  //     //   title: `Voulez-vous supprimer ${ids.length} archive(s) ?`,
  //     //   text: 'Cette action est irréversible.',
  //     //   icon: 'warning',
  //     //   showCancelButton: true,
  //     //   confirmButtonColor: '#dc2626',
  //     //   cancelButtonColor: '#6b7280',
  //     //   confirmButtonText: 'Oui, supprimer',
  //     //   cancelButtonText: 'Annuler',
  //     // }).then((result) => {
  //     //   if (result.isConfirmed) {
  //     //     this.archiveService.deleteArchivesBulk(ids).subscribe({
  //     //       next: () => {
  //     //         Swal.fire('Suppression réussie ✅');
  //     //         // Retirer les archives supprimées
  //     //         this.archives.update((list) => list.filter((a) => !ids.includes(a.publicId)));
  //     //         this.filteredArchives.update((list) => list.filter((a) => !ids.includes(a.publicId)));

  //     //         // Recalcul pagination
  //     //         const maxPage = Math.max(0, Math.ceil(this.filteredArchives().length / this.searchPage.size) - 1);
  //     //         if (this.searchPage.page > maxPage) this.searchPage.page = maxPage;

  //     //         this.updateVisibleArchives();
  //     //         this.selectionService.clearSelection();
  //     //         this.selectedRequests = [];
  //     //       },
  //     //       error: () => Swal.fire('Erreur lors de la suppression ❌'),
  //     //     });
  //     //   }
  //     // });
  //   }

  //   /** Met à jour la page visible */
  //   updateVisibleRequests(): void {
  //     // const start = this.searchPage.page * this.searchPage.size;
  //     // const end = start + this.searchPage.size;
  //     // const visible = (this.filteredArchives() || []).slice(start, end);
  //     // this.visiblearchivesIds.set(visible.map((a) => a.publicId!));
  //   }

  //   /** Chargement initial */
  //   loadRequests(): void {
  //     // this.archiveService.findAll(0, 1000).subscribe({
  //     //   next: (res: any) => {
  //     //     const archivesData = res?.value?.content || [];
  //     //     this.archives.set(archivesData);
  //     //     this.filteredArchives.set(archivesData);

  //     //     this.totalItems.set(archivesData.length);
  //     //     this.totalPages.set(Math.ceil(archivesData.length / this.searchPage.size));

  //     //     // Initialiser la page 0
  //     //     this.updateVisibleArchives();
  //     //   },
  //     // });
  //   }

  // applyFilters(): void {
  //   // Base = la liste complète (toujours partir de la source "archives")
  //   // const base = this.archives() || [];

  //   // // Normaliser la recherche
  //   // const search = (this.filters().title ?? '').toString().trim().toLowerCase();

  //   // // 1) Appliquer la recherche texte (si vide => on reprend tout)
  //   // let result = search ? base.filter((a: any) => {
  //   //   // protéger les champs inexistants
  //   //   const title = (a.title ?? '').toString().toLowerCase();
  //   //   const status = (a.status ?? '').toString().toLowerCase();
  //   //   const confidentiality = (a.confidentiality ?? '').toString().toLowerCase();
  //   //   const ownerType = (a.ownerType ?? '').toString().toLowerCase();
  //   //   const storage = (a.storageLocation ?? '').toString().toLowerCase();
  //   //   const categoryName  = (a.categoryName ?? '').toString().toLowerCase();

  //   //   return (
  //   //     title.includes(search) ||
  //   //     status.includes(search) ||
  //   //     confidentiality.includes(search) ||
  //   //     ownerType.includes(search) ||
  //   //     storage.includes(search) ||
  //   //     categoryName.includes(search)
  //   //   );
  //   // }) : [...base]; // spread pour retourner une nouvelle référence

  //   // // 2) Dates (si fournies)
  //   // if (this.filters().startDate) {
  //   //   const start = this.filters().startDate;
  //   //   result = result.filter((a: any) => (a.creationDate ?? '') >= start);
  //   // }
  //   // if (this.filters().endDate) {
  //   //   const end = this.filters().endDate;
  //   //   result = result.filter((a: any) => (a.creationDate ?? '') <= end);
  //   // }

  // // 3) Status / catégorie
  // if (this.filters().status) {
  //   result = result.filter((a: any) => a.status === this.filters().status);
  // }
  // if (this.filters().categoryPublicId) {
  //   result = result.filter((a: any) => a.categoryPublicId === this.filters().categoryPublicId);
  // }

  // console.log(result);

  // // 4) Mise à jour du state
  // this.filteredArchives.set(result);

  // // Pagination recalculée
  // this.totalItems.set(result.length);
  // this.totalPages.set(Math.ceil(result.length / this.searchPage.size));

  // // Reset page courante et recalcul visible
  // this.searchPage.page = 0;
  // this.updateVisibleArchives();
  // }

  // Affiche uniquement les archives de la page courante
  // get visibleRequests(): RequestDocument[] {
  //   // const list = this.filteredArchives() ?? [];
  //   // const start = this.searchPage.page * this.searchPage.size;
  //   // const end = start + this.searchPage.size;
  //   // return list.slice(start, end);
  //   return []
  // }

  // get visibleRequestIds(): string[] {
  //   // const archives = this.visibleArchives; // <-- pas filteredArchives direct
  //   // if (!archives || archives.length === 0) return [];
  //   // return archives.map((a) => a.publicId!);
  //   return [];
  // }

  // get allFilteredArchiveIds(): string[] {
  //   // return (this.filteredArchives() || []).map((a) => a.publicId!);
  //   return [];
  // }

  // /** Gestion pagination */
  // onPageChange(page: number): void {
  //   this.searchPage.page = page;
  //   this.updateVisibleRequests();
  // }

  // onSizeChange(size: number): void {
  //   this.searchPage.size = size;
  //   this.searchPage.page = 0; // reset
  //   this.updateVisibleRequests();
  // }

  // addRequest(request: any) {
  //   // this.archiveService.createArchive(archive, archive.documents, archive.storageLocation).subscribe({
  //   //   next: (createdState: any) => {
  //   //     console.log('BEFORE TEST');
  //   //     console.log(createdState);

  //   //     if (createdState?.status === 'OK' && createdState.value?.length) {
  //   //       // const newArchive = createdState.value; // ✅ extraire l'archive  return documents ajouter
  //   //       this.archives.update((list) => [archive, ...list]);
  //   //       // Optionnel : reset page pour que la nouvelle archive apparaisse
  //   //       // this.searchPage.page = 1;
  //   //       this.applyFilters();
  //   //       this.showModalCreate = false;
  //   //       this.toastService.show('Archive enregistrée avec succès ✅', 'SUCCESS');
  //   //     }
  //   //   },
  //   //   error: () => {
  //   //     this.toastService.show('Erreur lors de la création de l’archive ❌', 'DANGER');
  //   //   },
  //   // });

  // }

  // trackDocumentsChanges(request: RequestDocument) {
  //   // const originalDocs = this.originalDocuments() || []; // garder trace avant édition
  //   // const currentDocs = request.documents || [];
  //   // const newDocs = currentDocs.filter((d) => !d.id); // pas encore enregistrés
  //   // const removedDocs = originalDocs.filter((d: any) => !currentDocs.some((cd) => cd.id === d.id));
  //   // const updatedDocs = currentDocs.filter(
  //   //   (d) => d.id && originalDocs.some((od: any) => od.id === d.id && JSON.stringify(od) !== JSON.stringify(d)),
  //   // );
  //   // return { newDocs, removedDocs, updatedDocs };
  //   return [];
  // }

  // saveRequest(request: RequestDocument) {
  //   console.log('return to table ', request);

  //   // this.filteredArchives.update((list) => {
  //   //   const index = list.findIndex((a) => a.publicId === archive.publicId);
  //   //   if (index !== -1) {
  //   //     // mise à jour
  //   //     const newList = [...list];
  //   //     newList[index] = archive;
  //   //     return newList;
  //   //   } else {
  //   //     // création
  //   //     return [archive, ...list];
  //   //   }
  //   // });
  // }
}
