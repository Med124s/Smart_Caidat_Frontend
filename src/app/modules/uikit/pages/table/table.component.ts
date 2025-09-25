import { NgIf } from '@angular/common';
import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { TableActionComponent } from './components/table-action/table-action.component';
import { TableFooterComponent } from './components/table-footer/table-footer.component';
import { TableHeaderComponent } from './components/table-header/table-header.component';
import { TableRowComponent } from './components/table-row/table-row.component';
import { ConnectedUser, RegisterUser } from 'src/app/shared/models/user.model';
import { UserSearchService } from './services/user-search.service';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { UserComponent } from 'src/app/modules/user/user.component';
import Swal from 'sweetalert2';
import { Pagination } from 'src/app/shared/models/request.model';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    AngularSvgIconModule,
    FormsModule,
    TableHeaderComponent,
    TableFooterComponent,
    TableRowComponent,
    TableActionComponent,
    UserComponent,
    NgIf,
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
})
export class TableComponent implements OnInit {
  // http = inject(HttpClient);
  // filterService = inject(TableFilterService);
  // searchService = inject(UserSearchService);
  // selectionService = inject(UserSelectionService);
  // toastService = inject(ToastService);

  // showModalCreate = false;
  // showModalUpdate = false;
  // userUpdate: RegisterUser = {};

  // usersResults = signal<RegisterUser[]>([]);
  // currentPage = signal<number>(0);
  // totalItems = signal<number>(0);
  // totalPages = signal<number>(0);
  // loadingSearch = signal<boolean>(true);

  // showModal = false;

  // modalMode: 'create' | 'edit' | 'about' = 'create';

  // selectedUser = signal<RegisterUser | null>(null);

  // searchPage: Pagination = {
  //   page: 0,
  //   size: 5,
  //   sort: ['firstName', 'ASC'],
  // };

  // query: string = '';
  // searchSubscription?: Subscription;

  // ngOnInit(): void {
  //   this.initSearchResultListener();
  //   this.saveUserListener();
  //   this.loadUsers(); // 👈 Chargement initial
  // }

  // ngOnDestroy(): void {
  //   this.searchSubscription?.unsubscribe();
  // }

  // loadUsers(): void {
  //   const searchQuery: SearchQuery = {
  //     query: this.query,
  //     page: this.searchPage,
  //   };
  //   this.loadingSearch.set(true);
  //   this.searchService.search(searchQuery);
  // }

  // initSearchResultListener(): void {
  //   this.searchSubscription = this.searchService.searchResult.subscribe((usersState) => {
  //     if (usersState.status === 'OK' && usersState.value) {
  //       const res = usersState.value;
  //       console.log(res);

  //       this.usersResults.set(res.users);

  //       console.log(".......................................");
  //       console.log(this.usersResults());

  //       this.currentPage.set(res.currentPage);
  //       this.totalItems.set(res.totalItems);
  //       this.totalPages.set(res.totalPages);
  //     } else {
  //       this.toastService.show('Erreur lors de la récupération des utilisateurs', 'DANGER');
  //     }
  //     this.loadingSearch.set(false);
  //   });
  // }

  // saveUserListener(): void {
  //   // this.searchService.create.subscribe((state) => {
  //   //   if (state.status === 'OK') {
  //   //     const newUser = this.fromRestUser(state.value);
  //   //     this.usersResults.update((users) => [newUser, ...users]);
  //   //     this.toastService.show('Utilisateur enregistré avec succès', 'SUCCESS');
  //   //   } else {
  //   //     this.toastService.show("Erreur lors de la création de l'utilisateur", 'DANGER');
  //   //   }
  //   // });
  // }

  // fromRestUser(restUser: any): RegisterUser {
  //   return {
  //     firstName: restUser.firstname?.value,
  //     lastName: restUser.lastName?.value,
  //     email: restUser.email?.value,
  //     imageUrl: restUser.imageUrl?.value,
  //     password: '',
  //     publicId: restUser.userPublicId?.value,
  //     authorities: restUser.authorities?.map((a: any) => a?.name?.name ?? ''),
  //     lastSeen: restUser.lastSeen,
  //   };
  // }

  // toggleUsers(selectAll: boolean): void {
  //   // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  //   selectAll ? this.selectionService.selectAll(this.visibleUserIds) : this.selectionService.clearSelection();
  // }

  // createUser(): void {
  //   this.selectedUser.set(null);
  //   this.modalMode = 'create';
  //   this.showModal = true;
  // }

  // detailUser(user: any): void {
  //   console.log('____________ USER DETAIL');
  //   console.log(user);

  //   this.selectedUser.set(user);
  //   this.modalMode = 'about';
  //   this.showModal = true;
  // }

  // addUser(data: { user: RegisterUser; file?: File }): void {
  //   console.log('add user _____________> ______>');

  //   if (data.file) this.searchService.saveUser(data.user, data.file);
  // }

  // saveUser(user: any) {
  //   const current = this.usersResults();
  //   const index = current.findIndex((r) => r.publicId === user.publicId);

  //   if (index > -1) {
  //     // update
  //     // current[index] = Complaint;
  //     // this.complaints.set([...current]);
  //     current[index] = { ...current[index], ...user };
  //     this.usersResults.set([...current]);
  //   } else {
  //     // create → ajouter en haut
  //     this.usersResults.set([user, ...current]);
  //     this.totalItems.set(this.totalItems() + 1);
  //   }

  //   // // recalculer visible (pagination simple)
  //   // const start = this.searchPage.page * this.searchPage.size;
  //   // const end = start + this.searchPage.size;
  //   // this.visiblecomplaints.set(this.complaints().slice(start, end));
  // }

  // updateUser(data: { user: RegisterUser; file?: File }): void {
  //   this.searchService.updateUser(data.user, data.file);
  //   this.usersResults.update((users) => {
  //     const i = users.findIndex((u) => u.publicId === data.user.publicId);
  //     if (i !== -1) users[i] = { ...users[i], ...data.user };
  //     return [...users];
  //   });
  // }

  // filteredUsers = computed(() => {
  //   const search = this.filterService.searchField().toLowerCase().trim();
  //   return this.usersResults().filter(
  //     (user) =>
  //       [user.firstName, user.lastName, user.email, user.publicId].some((val) =>
  //         val?.toString().toLowerCase().includes(search),
  //       ) || user.authorities?.some((a) => a?.toLowerCase().includes(search)),
  //   );
  // });

  // get visibleUserIds(): string[] {
  //   return this.filteredUsers().map((u) => u.publicId!);
  // }

  // // ⬇️ Connecté au composant <app-table-footer>
  // onPageChange(page: number): void {
  //   this.searchPage.page = page;
  //   this.loadUsers();
  // }

  // onSizeChange(size: number): void {
  //   this.searchPage.size = size;
  //   this.searchPage.page = 0; // Revenir à la première page
  //   this.loadUsers();
  // }
  // updateUsersResults = (fn: (users: RegisterUser[]) => RegisterUser[]) => {
  //   this.usersResults.update(fn);
  // };

  // onDeleteSelected(event: any) {}

  // onUpdateUser(user: any) {
  //   console.log('____________ USER Update');
  //   console.log(user);
  //   this.selectedUser.set(user);
  //   this.modalMode = 'edit';
  //   this.showModal = true;
  // }

  // Pagination

  searchPage = { page: 0, size: 5 };
  totalItems = signal(0);
  totalPages = signal(0);

  // Données
  users = signal<RegisterUser[]>([]);
  filteredUsers = signal<RegisterUser[]>([]);
  visibleUsers = signal<RegisterUser[]>([]);
  visibleUserIds = signal<string[]>([]);

  // Modal
  selectedUser = signal<RegisterUser | null>(null);
  showModal = false;
  modalMode: 'create' | 'edit' | 'about' = 'create';

  selectedIds = signal<string[]>([]);

  // Sélection
  selectedUsers: RegisterUser[] = [];

  // Services
  userService = inject(UserSearchService);
  toastService = inject(ToastService);

  currentUser: ConnectedUser | null = null;

  /** ==================== LOAD ==================== */
  pagination: Pagination = {
    page: 0,
    size: 10000,
    sort: ['createdDate,desc'], // tri par date de création décroissante,
  };

  // Filtrage
  filters = signal({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    globalSearch: '',
  });

  visiblecomplaints = signal<RegisterUser[]>([...this.users()]);

  constructor() {
    effect(() => this.applyFilters());
  }
  ngOnInit() {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loadingSearch.set(true);

    this.userService.search('', this.pagination).subscribe({
      next: (state: any) => {
        if (state.status === 'OK' && state.value) {
          const data = state.value.data;
          this.users.set(data);
          this.filteredUsers.set(data.length);
          this.totalItems.set(state.value.totalItems);

          this.totalPages.set(Math.ceil(data.length / this.searchPage.size));

          console.log(this.totalPages());

          this.updateVisibleUsers();
        } else if (state.status === 'ERROR') {
          this.toastService.show('Erreur lors du chargement des utilisateurs ❌', 'DANGER');
        }
        this.loadingSearch.set(false);
      },
      error: () => {
        this.toastService.show('Erreur lors du chargement des utilisateurs ❌', 'DANGER');
        this.loadingSearch.set(false);
      },
    });
  }

  saveUser(user: any) {
    const currentUsers = this.users();
    const currentFiltered = this.filteredUsers();
    const index = currentUsers.findIndex((u) => u.publicId === user.publicId);

    if (index > -1) {
      currentUsers[index] = { ...currentUsers[index], ...user };
      currentFiltered[index] = { ...currentFiltered[index], ...user };
    } else {
      currentUsers.unshift(user);
      currentFiltered.unshift(user);
      this.totalItems.set(this.totalItems() + 1);
    }

    this.users.set([...currentUsers]);
    // this.filteredUsers.set([...currentFiltered]);

    this.filteredUsers.set(Array.isArray(currentFiltered) ? currentFiltered : []);
    this.updateVisibleUsers();
  }

  updateUser(data: { user: RegisterUser; file?: File }): void {
    this.userService.update(data.user, data.file);
    this.users.update((users) => {
      const i = users.findIndex((u) => u.publicId === data.user.publicId);
      if (i !== -1) users[i] = { ...users[i], ...data.user };
      return [...users];
    });
    this.filteredUsers.update((users) => {
      const i = users.findIndex((u) => u.publicId === data.user.publicId);
      if (i !== -1) users[i] = { ...users[i], ...data.user };
      return [...users];
    });
    this.updateVisibleUsers();
  }

  toggleUsers(selectAll: boolean): void {
    if (selectAll) {
      this.selectedUsers = [...this.visibleUsers()];
    } else {
      this.selectedUsers = [];
    }
  }

  /** ==================== FILTRE ==================== */
  // applyFilters() {
  //   const filtered = this.users().filter((u) => {
  //     const matchFirst = this.filters().firstName
  //       ? u.firstName?.toLowerCase().includes(this.filters().firstName.toLowerCase())
  //       : true;
  //     const matchLast = this.filters().lastName
  //       ? u.lastName?.toLowerCase().includes(this.filters().lastName.toLowerCase())
  //       : true;
  //     const matchEmail = this.filters().email
  //       ? u.email?.toLowerCase().includes(this.filters().email.toLowerCase())
  //       : true;
  //     const matchRole = this.filters().role ? u.authorities?.includes(this.filters().role) : true;
  //     const matchSearch = this.filters().globalSearch
  //       ? u.firstName?.toLowerCase().includes(this.filters().globalSearch.toLowerCase()) ||
  //         u.lastName?.toLowerCase().includes(this.filters().globalSearch.toLowerCase()) ||
  //         u.email?.toLowerCase().includes(this.filters().globalSearch.toLowerCase())
  //       : true;
  //     return matchFirst && matchLast && matchEmail && matchRole && matchSearch;
  //   });

  //   this.filteredUsers.set(filtered);
  //   this.totalItems.set(filtered.length);
  //   this.totalPages.set(Math.ceil(filtered.length / this.searchPage.size));
  //   this.searchPage.page = 0;
  //   this.updateVisibleUsers();
  // }

  applyFilters() {
    // 1️⃣ Filtrer les réclamations
    const filtered = this.users().filter((req: any) => {
      console.log(req);

      const matchSearch = this.currentFilters
        ? req.firstName?.toLowerCase().includes(this.currentFilters.toLowerCase()) ||
          req.lastName?.toLowerCase().includes(this.currentFilters.toLowerCase()) ||
          req.email?.toLowerCase().includes(this.currentFilters.toLowerCase()) ||
          (req.authorities ?? []).some((auth:any) => auth.toLowerCase().includes(this.currentFilters.toLowerCase()))
        : true;

      return matchSearch;
    });

    this.filteredUsers.set(filtered);
    this.totalItems.set(filtered.length);
    this.totalPages.set(Math.ceil(filtered.length / this.searchPage.size));
    this.searchPage.page = 0;
    this.updateVisibleUsers();
  }

  /** ==================== VISIBLE ==================== */
  updateVisibleUsers(): void {
    const start = this.searchPage.page * this.searchPage.size;
    const end = start + this.searchPage.size;
    const arr = Array.isArray(this.filteredUsers()) ? this.filteredUsers() : [];

    const visible = arr.slice(start, end);

    this.visibleUsers.set(visible);
    this.visibleUserIds.set(visible.map((u) => u.publicId!));
  }

  /** ==================== MODAL ==================== */
  showCreateModal(): void {
    this.selectedUser.set(null);
    this.modalMode = 'create';
    this.showModal = true;
  }

  detailUser(user: RegisterUser): void {
    this.selectedUser.set(user);
    this.modalMode = 'about';
    this.showModal = true;
  }

  onUpdateUser(user: any) {
    console.log('____________ USER Update');
    console.log(user);
    this.selectedUser.set(user);
    this.modalMode = 'edit';
    this.showModal = true;
  }

  /** ==================== DELETE ==================== */
  onDeleteSelected(selectedIds: any) {
    if (selectedIds.length === 0) {
      Swal.fire({ text: 'Aucun utilisateur sélectionné', icon: 'warning' });
      return;
    }

    Swal.fire({
      title: `Voulez-vous supprimer ${selectedIds.length} utilisateur(s) ?`,
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteUsersBulk(selectedIds).subscribe({
          next: (state) => {
            if (state.status === 'OK' && state.value) {
              Swal.fire('Suppression réussie ✅');
              this.users.update((list) => list.filter((u) => !state.value!.includes(u.publicId!)));
              this.filteredUsers.update((list) => list.filter((u) => !state.value!.includes(u.publicId!)));
              this.updateVisibleUsers();
            }
          },
          error: () => Swal.fire('Erreur lors de la suppression ❌'),
        });
      }
    });
  }

  // الحفظ ديال آخر فيلترات
  currentFilters: string = '';

  onFilter(filters: any) {
    this.currentFilters = filters;
    this.applyFilters();
  }

  /** ==================== PAGINATION ==================== */
  onPageChange(page: number) {
    this.searchPage.page = page;
    this.updateVisibleUsers();
  }

  onSizeChange(size: number) {
    this.searchPage.size = size;
    this.searchPage.page = 0;
    this.updateVisibleUsers();
  }

  loadingSearch = signal(false);
}
