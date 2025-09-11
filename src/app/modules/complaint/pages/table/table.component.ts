import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { State } from 'src/app/shared/models/state.model';
import { SearchResponse } from '../../model/complaint-search';
import { ConnectedUser } from 'src/app/shared/models/user.model';
import { Oauth2AuthService } from 'src/app/modules/auth/oauth2-auth.service';
import Swal from 'sweetalert2';
import { TableComplaintsActionComponent } from './components/table-action/table-action.component';
import { TableComplaintsFooterComponent } from './components/table-footer/table-footer.component';
import { TableComplaintsHeaderComponent } from './components/table-header/table-header.component';
import { TableComplaintsRowComponent } from './components/table-row/table-row.component';
import { Complaint, ComplaintStatus } from '../../model/complaint.model';
import { ComplaintService } from './services/complaint.service';
import { Pagination } from 'src/app/shared/models/request.model';
import { ComplaintsRequestComponent } from '../modal/complaints';

@Component({
  selector: 'app-complaints-table',
  imports: [
    TableComplaintsActionComponent,
    TableComplaintsFooterComponent,
    TableComplaintsHeaderComponent,
    TableComplaintsRowComponent,
    ComplaintsRequestComponent,
  ],
  templateUrl: './table.component.html',
})
export class ComplaintsTableComponent implements OnInit {
  // pagination
  searchPage = { page: 0, size: 5 };
  totalItems = signal(0);
  totalPages = signal(0);
  currentUser: ConnectedUser | null = null;

  // données
  complaints = signal<Complaint[]>([]);
  filteredcomplaints = signal<Complaint[]>([]);
  visibleComplaintIds = signal<string[]>([]);

  // modal
  selectedComplaint = signal<Complaint | null>(null);
  aboutComplaint = signal<Complaint | null>(null);
  showModal = false;
  showAboutModal = false;
  modalMode: 'create' | 'edit' | 'about' = 'create';

  // sélection
  selectedcomplaints: Complaint[] = [];

  // service
  complaintservice = inject(ComplaintService);
  toastService = inject(ToastService);

  loadingSearch = signal(false);

  filters = signal({
    title: '',
    type: '',
    status: '',
    description: '',
    motif: '',
    citizenCin: '',
    priority: '',
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
    this.loadcomplaints();
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

  loadcomplaints(): void {
    this.loadingSearch.set(true);

    this.complaintservice.search('', this.pagination).subscribe((state: State<SearchResponse<Complaint>>) => {
      console.log('complaints data.......................');
      console.log(state);
      if (state.status === 'OK' && state.value) {
        let data = state.value.data;

        // ⚡ appliquer le filtre selon le rôle
        if (!this.isAdmin()) {
          data = data.filter((req) => req.createdBy?.publicId === this.currentUser?.publicId);
        }

        this.complaints.set(data);
        this.filteredcomplaints.set(data);
        this.totalItems.set(data.length);
        this.totalPages.set(Math.ceil(data.length / this.searchPage.size));
        this.updateVisiblecomplaints();
      } else if (state.status === 'ERROR') {
        this.toastService.show('Erreur lors du chargement des réclamations ❌', 'DANGER');
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

  // signal للطلبات المعروضة

  applyFilters() {
    // 1️⃣ Filtrer les réclamations
    const filtered = this.complaints().filter((req: any) => {
      const matchType = this.currentFilters.type ? req.type === this.currentFilters.type : true;
      const matchStatus = this.currentFilters.status ? req.status === this.currentFilters.status : true;
      const matchPriority = this.currentFilters.priority ? req.priority === this.currentFilters.priority : true;
      const matchSearch = this.currentFilters.globalSearch
        ? req.description?.toLowerCase().includes(this.currentFilters.globalSearch.toLowerCase()) ||
          req.citizen.firstName?.toLowerCase().includes(this.currentFilters.globalSearch.toLowerCase()) ||
          req.citizen.lastName?.toLowerCase().includes(this.currentFilters.globalSearch.toLowerCase()) ||
          req.reason?.toLowerCase().includes(this.currentFilters.globalSearch.toLowerCase())
        : true;

      return matchType && matchStatus && matchSearch && matchPriority;
    });

    // 2️⃣ Mettre à jour filteredcomplaints
    this.filteredcomplaints.set(filtered);

    // 3️⃣ Mettre à jour totalItems et totalPages
    this.totalItems.set(filtered.length);
    this.totalPages.set(Math.ceil(filtered.length / this.searchPage.size));

    // 4️⃣ Remise à zéro de la page
    this.searchPage.page = 0;

    // 5️⃣ Mettre à jour visiblecomplaints pour la page actuelle
    this.updateVisiblecomplaints();
  }

  visiblecomplaints = signal<Complaint[]>([...this.complaints()]);

  // الحفظ ديال آخر فيلترات
  currentFilters: any = {
    type: '',
    status: '',
    priority: '',
    globalSearch: '',
  };

  /** ==================== VISIBLE ==================== */
  updateVisiblecomplaints(): void {
    const list = this.filteredcomplaints() ?? [];
    const start = this.searchPage.page * this.searchPage.size;
    const end = start + this.searchPage.size;
    const visible = list.slice(start, end);

    this.visiblecomplaints.set(visible);
    this.visibleComplaintIds.set(visible.map((a) => a.publicId!));
  }

  /** ==================== MODAL ==================== */
  showCreateModal(): void {
    this.selectedComplaint.set(null);
    this.modalMode = 'create';
    this.showModal = true;
  }

  detailComplaint(Complaint: Complaint): void {
    this.selectedComplaint.set(Complaint);
    this.modalMode = 'edit';
    this.showModal = true;
  }
  onAboutcomplaint(complaint: Complaint): void {
    this.selectedComplaint.set(complaint);
    this.modalMode = 'about';
    this.showModal = true;
  }

  handleStatusUpdate(event: { complaint: Complaint; newStatus: ComplaintStatus; reason: string | undefined }) {
    const { complaint, newStatus, reason } = event;

    if (!complaint.publicId || !this.currentUser) {
      this.toastService.show('⚠️ Impossible de mettre à jour le statut (utilisateur ou ID invalide)', 'WARNING');
      return;
    }

    this.complaintservice
      .updateStatus(complaint.publicId, newStatus, reason, this.currentUser.publicId!)
      .subscribe((state) => {
        switch (state.status) {
          case 'INIT':
            console.log('⏳ Mise à jour en cours...');
            break;

          case 'OK':
            if (state.value) {
              // 🔄 Mettre à jour uniquement les champs nécessaires
              console.log('.2.2.2.2');
              console.log(state);
              complaint.status = state.value.status;
              complaint.reason = state.value.reason;
              complaint.validationDate = state.value.validationDate;
              // complaint.validatorPublicId = state.value.validatorPublicId;

              this.toastService.show(`✅ Statut mis à jour : ${this.prettyStatus(newStatus)}`, 'SUCCESS');
            }
            break;

          case 'ERROR':
            this.toastService.show('❌ Erreur lors de la mise à jour du statut', 'DANGER');
            break;
        }
      });
  }

  private prettyStatus(status: ComplaintStatus): string {
    switch (status) {
      case ComplaintStatus.RESOLVED:
        return 'Résolue';
      case ComplaintStatus.REJECTED:
        return 'Rejetée';
      case ComplaintStatus.OPEN:
        return 'Ouverte';
      case ComplaintStatus.IN_PROGRESS:
        return 'En cours';
      default:
        return 'Inconnu';
    }
  }

  saveComplaint(Complaint: Complaint) {
    console.log(Complaint);

    const current = this.complaints();
    const index = current.findIndex((r) => r.publicId === Complaint.publicId);

    if (index > -1) {
      // update
      // current[index] = Complaint;
      // this.complaints.set([...current]);
      current[index] = { ...current[index], ...Complaint };
      this.complaints.set([...current]);
    } else {
      // create → ajouter en haut
      this.complaints.set([Complaint, ...current]);
      this.totalItems.set(this.totalItems() + 1);
    }

    // recalculer visible (pagination simple)
    const start = this.searchPage.page * this.searchPage.size;
    const end = start + this.searchPage.size;
    this.visiblecomplaints.set(this.complaints().slice(start, end));
  }

  get visibleIds() {
    return this.visibleComplaintIds();
  }

  /** ==================== DELETE ==================== */
  onDeleteSelected(selectedIds: any[]) {
    const ids = selectedIds;
    if (ids.length === 0) {
      Swal.fire({ text: 'Aucune réclamation sélectionnée', icon: 'warning' });
      return;
    } else {
      Swal.fire({
        title: `Voulez-vous supprimer ${ids.length} réclamation(s) ?`,
        text: 'Cette action est irréversible.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler',
      }).then((result) => {
        if (result.isConfirmed) {
          this.complaintservice.delete(ids).subscribe({
            next: (state) => {
              Swal.fire('Suppression réussie ✅');
              // Retirer les réclamations supprimées
              this.complaints.update((list) => list.filter((r) => !state.value!.includes(r.publicId!)));
              this.filteredcomplaints.update((list) => list.filter((r) => !state.value!.includes(r.publicId!)));
              this.updateVisiblecomplaints();
            },
            error: () => Swal.fire('Erreur lors de la suppression ❌'),
          });
        }
      });
    }
  }

  /** ==================== PAGINATION ==================== */
  onPageChange(page: number) {
    this.searchPage.page = page;
    this.updateVisiblecomplaints();
  }

  onSizeChange(size: number) {
    this.searchPage.size = size;
    this.searchPage.page = 0;
    this.updateVisiblecomplaints();
  }
}
