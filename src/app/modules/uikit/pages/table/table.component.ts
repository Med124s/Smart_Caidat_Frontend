import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { TableActionComponent } from './components/table-action/table-action.component';
import { TableFooterComponent } from './components/table-footer/table-footer.component';
import { TableHeaderComponent } from './components/table-header/table-header.component';
import { TableRowComponent } from './components/table-row/table-row.component';
import { TableFilterService } from './services/table-filter.service';
import { RegisterUser } from 'src/app/shared/models/user.model';
import { UserSearchService } from './services/user-search.service';
import { Pagination } from 'src/app/shared/models/request.model';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { Subscription } from 'rxjs';
import { SearchQuery } from './model/user-search.model';
import { UserComponent } from 'src/app/modules/user/user.component';
import { UserSelectionService } from './services/user-selection.service';

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
    
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
})
export class TableComponent implements OnInit, OnDestroy {
  http = inject(HttpClient);
  filterService = inject(TableFilterService);
  searchService = inject(UserSearchService);
  selectionService = inject(UserSelectionService);
  toastService = inject(ToastService);

  showModalCreate = false;
  showModalUpdate = false;
  userUpdate: RegisterUser = {};

  usersResults = signal<RegisterUser[]>([]);
  currentPage = signal<number>(0);
  totalItems = signal<number>(0);
  totalPages = signal<number>(0);
  loadingSearch = signal<boolean>(true);

  showModal = false;

  modalMode: 'create' | 'edit' | 'about' = 'create';

  selectedUser = signal<RegisterUser | null>(null);

  searchPage: Pagination = {
    page: 0,
    size: 5,
    sort: ['firstName', 'ASC'],
  };

  query: string = '';
  searchSubscription?: Subscription;

  ngOnInit(): void {
    this.initSearchResultListener();
    this.saveUserListener();
    this.loadUsers(); // 👈 Chargement initial
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  loadUsers(): void {
    const searchQuery: SearchQuery = {
      query: this.query,
      page: this.searchPage,
    };
    this.loadingSearch.set(true);
    this.searchService.search(searchQuery);
  }

  initSearchResultListener(): void {
    this.searchSubscription = this.searchService.searchResult.subscribe((usersState) => {
      if (usersState.status === 'OK' && usersState.value) {
        const res = usersState.value;
        console.log(res);

        this.usersResults.set(res.users);
        this.currentPage.set(res.currentPage);
        this.totalItems.set(res.totalItems);
        this.totalPages.set(res.totalPages);
      } else {
        this.toastService.show('Erreur lors de la récupération des utilisateurs', 'DANGER');
      }
      this.loadingSearch.set(false);
    });
  }

  saveUserListener(): void {
    // this.searchService.create.subscribe((state) => {
    //   if (state.status === 'OK') {
    //     const newUser = this.fromRestUser(state.value);
    //     this.usersResults.update((users) => [newUser, ...users]);
    //     this.toastService.show('Utilisateur enregistré avec succès', 'SUCCESS');
    //   } else {
    //     this.toastService.show("Erreur lors de la création de l'utilisateur", 'DANGER');
    //   }
    // });
  }

  fromRestUser(restUser: any): RegisterUser {
    return {
      firstName: restUser.firstname?.value,
      lastName: restUser.lastName?.value,
      email: restUser.email?.value,
      imageUrl: restUser.imageUrl?.value,
      password: '',
      publicId: restUser.userPublicId?.value,
      authorities: restUser.authorities?.map((a: any) => a?.name?.name ?? ''),
      lastSeen: restUser.lastSeen,
    };
  }

  toggleUsers(selectAll: boolean): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    selectAll ? this.selectionService.selectAll(this.visibleUserIds) : this.selectionService.clearSelection();
  }

  createUser(): void {
    this.selectedUser.set(null);
    this.modalMode = 'create';
    this.showModal = true;
  }

  detailUser(user: any): void {
    console.log('____________ USER DETAIL');
    console.log(user);

    this.selectedUser.set(user);
    this.modalMode = 'about';
    this.showModal = true;
  }

  addUser(data: { user: RegisterUser; file?: File }): void {
    console.log("add user _____________> ______>");
    
    if (data.file) this.searchService.saveUser(data.user, data.file);
  }

  saveUser(user: any) {
    console.log(user);
  }

  updateUser(data: { user: RegisterUser; file?: File }): void {
    this.searchService.updateUser(data.user, data.file);
    this.usersResults.update((users) => {
      const i = users.findIndex((u) => u.publicId === data.user.publicId);
      if (i !== -1) users[i] = { ...users[i], ...data.user };
      return [...users];
    });
  }

  // detailUser(user: RegisterUser): void {
  //   this.showModalUpdate = true;
  //   this.userUpdate = { ...user };
  // }

  filteredUsers = computed(() => {
    const search = this.filterService.searchField().toLowerCase().trim();
    return this.usersResults().filter(
      (user) =>
        [user.firstName, user.lastName, user.email, user.publicId].some((val) =>
          val?.toString().toLowerCase().includes(search),
        ) || user.authorities?.some((a) => a?.toLowerCase().includes(search)),
    );
  });

  get visibleUserIds(): string[] {
    return this.filteredUsers().map((u) => u.publicId!);
  }

  // ⬇️ Connecté au composant <app-table-footer>
  onPageChange(page: number): void {
    this.searchPage.page = page;
    this.loadUsers();
  }

  onSizeChange(size: number): void {
    this.searchPage.size = size;
    this.searchPage.page = 0; // Revenir à la première page
    this.loadUsers();
  }
  updateUsersResults = (fn: (users: RegisterUser[]) => RegisterUser[]) => {
    this.usersResults.update(fn);
  };

  onDeleteSelected(event: any) {}

  onUpdateUser(user: any) {
    console.log('____________ USER Update');
    console.log(user);
    this.selectedUser.set(user);
    this.modalMode = 'edit';
    this.showModal = true;
  }
}
