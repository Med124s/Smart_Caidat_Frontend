import { Component, effect, inject, OnInit, signal } from '@angular/core';
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
import Swal from 'sweetalert2';

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
    type: '',
    status: '',
    description: '',
    motif: '',
    citizenCin: '',
    globalSearch: '',
  });

  selectedIds = signal<string[]>([]);
  oauth2Auth = inject(Oauth2AuthService);

  constructor() {
    effect(() => {
      this.applyFilters();
    });
  }
  ngOnInit(): void {
    this.loadRequests();
    const state: State<ConnectedUser> = this.oauth2Auth.fetchUser();
    if (state.status === 'OK' && state.value) {
      this.currentUser = state.value;
    }
    // ✅ réagir automatiquement quand filters changent
    console.log('____________________________ CURRENT USER ____________________');

    console.log(this.currentUser);
  }

  /** ==================== LOAD ==================== */
  pagination: Pagination = {
    page: 0,
    size: 10000,
    sort: ['creationDate,desc'], // tri par date de création décroissante,
  };
  // loadRequests(): void {
  //   this.loadingSearch.set(true);
  //   this.requestService.search('', this.pagination).subscribe((state: State<SearchResponse<RequestDocument>>) => {
  //     if (state.status === 'OK' && state.value) {
  //       console.log('___________requests__________________');
  //       console.log(state?.value['data']);

  //       this.requests.set(state.value?.data);
  //       this.filteredRequests.set(state.value.data);
  //       this.totalItems.set(state.value.totalItems);
  //       this.totalPages.set(state.value.totalPages);
  //       this.updateVisibleRequests();
  //     } else if (state.status === 'ERROR') {
  //       this.toastService.show('Erreur lors du chargement des demandes ❌', 'DANGER');
  //     }
  //     this.loadingSearch.set(false);
  //   });
  // }

  loadRequests(): void {
    this.loadingSearch.set(true);

    this.requestService.search('', this.pagination).subscribe((state: State<SearchResponse<RequestDocument>>) => {
      if (state.status === 'OK' && state.value) {
        let data = state.value.data;

        // ⚡ appliquer le filtre selon le rôle
        if (!this.isAdmin()) {
          data = data.filter((req) => req.creatorPublicId === this.currentUser?.publicId);
        }

        this.requests.set(data);
        this.filteredRequests.set(data);
        this.totalItems.set(data.length);
        this.totalPages.set(Math.ceil(data.length / this.searchPage.size));
        this.updateVisibleRequests();
      } else if (state.status === 'ERROR') {
        this.toastService.show('Erreur lors du chargement des demandes ❌', 'DANGER');
      }
      this.loadingSearch.set(false);
    });
  }

  onFilter(filters: any) {
    this.currentFilters = filters;

    this.applyFilters();
  }

  /** Helper pour savoir si user est admin */
  isAdmin(): boolean {
    return this.currentUser?.authorities?.includes('ROLE_ADMIN') ?? false;
  }

  // applyFilters() {
  //   this.visibleRequests.set(
  //     this.requests().filter((req: any) => {
  //       const matchType = this.currentFilters.type ? req.type === this.currentFilters.type : true;

  //       const matchStatus = this.currentFilters.status ? req.status.value === this.currentFilters.status : true;
  //       const matchSearch = this.currentFilters.globalSearch
  //         ? req.description?.toLowerCase().includes(this.currentFilters.globalSearch.toLowerCase()) ||
  //           req.citizenCin?.toLowerCase().includes(this.currentFilters.globalSearch.toLowerCase()) ||
  //           req.motif?.toLowerCase().includes(this.currentFilters.globalSearch.toLowerCase())
  //         : true;

  //         //   // pagination
  // //   this.totalItems.set(result.length);
  // //   this.totalPages.set(Math.ceil(result.length / this.searchPage.size));
  // //   this.searchPage.page = 0;
  // //   this.updateVisibleRequests();
  //       return matchType && matchStatus && matchSearch;
  //     }),
  //   );
  // }

  // signal للطلبات المعروضة

  applyFilters() {
    // 1️⃣ Filtrer les demandes
    const filtered = this.requests().filter((req: any) => {
      const matchType = this.currentFilters.type ? req.type === this.currentFilters.type : true;
      const matchStatus = this.currentFilters.status ? req.status.value === this.currentFilters.status : true;
      const matchSearch = this.currentFilters.globalSearch
        ? req.description?.toLowerCase().includes(this.currentFilters.globalSearch.toLowerCase()) ||
          req.citizenCin?.toLowerCase().includes(this.currentFilters.globalSearch.toLowerCase()) ||
          req.motif?.toLowerCase().includes(this.currentFilters.globalSearch.toLowerCase())
        : true;

      return matchType && matchStatus && matchSearch;
    });

    // 2️⃣ Mettre à jour filteredRequests
    this.filteredRequests.set(filtered);

    // 3️⃣ Mettre à jour totalItems et totalPages
    this.totalItems.set(filtered.length);
    this.totalPages.set(Math.ceil(filtered.length / this.searchPage.size));

    // 4️⃣ Remise à zéro de la page
    this.searchPage.page = 0;

    // 5️⃣ Mettre à jour visibleRequests pour la page actuelle
    this.updateVisibleRequests();
  }

  visibleRequests = signal<RequestDocument[]>([...this.requests()]);

  // الحفظ ديال آخر فيلترات
  currentFilters: any = {
    type: '',
    status: '',
    globalSearch: '',
  };

  /** ==================== VISIBLE ==================== */
  updateVisibleRequests(): void {
    const list = this.filteredRequests() ?? [];
    const start = this.searchPage.page * this.searchPage.size;
    const end = start + this.searchPage.size;
    const visible = list.slice(start, end);

    this.visibleRequests.set(visible);
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
        //   if (newStatus === RequestStatus.APPROVED) {
        //     this.generateAndUploadPDF(request);
        //   }
        // } else {
        //   this.toastService.show('❌ Erreur lors du changement de statut', 'DANGER');
        //   console.error('Erreur:', state.error);
        // }
      }
    });
  }
  // async generateAndUploadPDF(request: RequestDocument) {
  //   try {
  //     // 1️⃣ Génération du PDF (par exemple avec jsPDF)
  //     const doc = new jsPDF();
  //     doc.text(`Certificat de la demande ${request.publicId}`, 10, 10);
  //     const pdfBlob = doc.output('blob');

  //     // 2️⃣ Upload vers le backend / MinIO
  //     this.requestService.uploadCertificate(request.publicId!, pdfBlob).subscribe({
  //       next: () => this.toastService.show('PDF généré et uploadé ✅', 'SUCCESS'),
  //       error: () => this.toastService.show('Erreur lors de l’upload du PDF ❌', 'DANGER'),
  //     });
  //   } catch (error) {
  //     console.error(error);
  //     this.toastService.show('Erreur lors de la génération du PDF ❌', 'DANGER');
  //   }
  // }

  /** ==================== SAVE / ADD ==================== */
  // saveRequest(request: RequestDocument) {
  //   this.filteredRequests.update((list) => {
  //     const index = list.findIndex((a) => a.publicId === request.publicId);
  //     if (index !== -1) {
  //       // mise à jour
  //       const newList = [...list];
  //       newList[index] = request;
  //       return newList;
  //     } else {
  //       // création
  //       return [request, ...list];
  //     }
  //   });
  // }

  saveRequest(request: RequestDocument) {
    console.log('_________ requ');
    console.log(request);

    const current = this.requests();
    const index = current.findIndex((r) => r.publicId === request.publicId);

    if (index > -1) {
      // update
      // current[index] = request;
      // this.requests.set([...current]);
      current[index] = { ...current[index], ...request };
      this.requests.set([...current]);
    } else {
      // create → ajouter en haut
      this.requests.set([request, ...current]);
      this.totalItems.set(this.totalItems() + 1);
    }

    // recalculer visible (pagination simple)
    const start = this.searchPage.page * this.searchPage.size;
    const end = start + this.searchPage.size;
    this.visibleRequests.set(this.requests().slice(start, end));
  }

  get visibleIds() {
    return this.visibleRequestIds();
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
    const ids = selectedIds;
    if (ids.length === 0) {
      Swal.fire({ text: 'Aucune demande sélectionnée', icon: 'warning' });
      return;
    } else {
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
          this.requestService.delete(ids).subscribe({
            next: (state) => {
              Swal.fire('Suppression réussie ✅');
              // Retirer les archives supprimées
              this.requests.update((list) => list.filter((r) => !state.value!.includes(r.publicId!)));
              this.filteredRequests.update((list) => list.filter((r) => !state.value!.includes(r.publicId!)));
              this.updateVisibleRequests();
            },
            error: () => Swal.fire('Erreur lors de la suppression ❌'),
          });
        }
      });
    }
    // if (selectedIds.length === 0) {
    //   Swal.fire({ text: 'Aucune demande sélectionnée', icon: 'warning' });
    //   return;
    // }
    // this.requestService.delete(selectedIds).subscribe((state: State<string[]>) => {
    //   console.log(state);

    //   if (state.status === 'INIT') {
    //     console.log('LOADING');
    //   } else if (state.status === 'OK' && state.value) {
    //     this.requests.update((list) => list.filter((r) => !state.value!.includes(r.publicId!)));
    //     this.filteredRequests.update((list) => list.filter((r) => !state.value!.includes(r.publicId!)));
    //     this.toastService.show('Demandes supprimées ✅', 'SUCCESS');
    //     this.updateVisibleRequests();
    //   } else {
    //     this.toastService.show('Erreur lors de la suppression ❌', 'DANGER');
    //   }
    // });
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
}
