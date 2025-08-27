// // import { HttpClient } from '@angular/common/http';
// // import { Component, computed, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
// // import { FormsModule } from '@angular/forms';
// // import { AngularSvgIconModule } from 'angular-svg-icon';
// // import { toast } from 'ngx-sonner';
// // import { TableActionComponent } from './components/table-action/table-action.component';
// // import { TableFooterComponent } from './components/table-footer/table-footer.component';
// // import { TableHeaderComponent } from './components/table-header/table-header.component';
// // import { TableRowComponent } from './components/table-row/table-row.component';
// // import { TableFilterService } from './services/table-filter.service';
// // import { BaseUser, RegisterUser } from 'src/app/shared/models/user.model';
// // import { UserSearchService } from './services/user-search.service';
// // import { Pagination } from 'src/app/shared/models/request.model';
// // import { ToastService } from 'src/app/shared/toast/toast.service';
// // import { Subscription, filter } from 'rxjs';
// // import { SearchQuery } from './model/user-search.model';
// // import { UserComponent } from 'src/app/modules/user/user.component';
// // import { UserSelectionService } from './services/user-selection.service';

// // @Component({
// //   selector: 'app-table',
// //   imports: [
// //     AngularSvgIconModule,
// //     FormsModule,
// //     TableHeaderComponent,
// //     TableFooterComponent,
// //     TableRowComponent,
// //     TableActionComponent,
// //     UserComponent,
// //   ],
// //   templateUrl: './table.component.html',
// //   styleUrl: './table.component.css',
// // })
// // export class TableComponent implements OnInit, OnDestroy {
// //   //users = signal<BaseUser[]>([]);
// //   http = inject(HttpClient);
// //   filterService = inject(TableFilterService);
// //   searchService = inject(UserSearchService);
// //   selectionService = inject(UserSelectionService);
// //   toastService = inject(ToastService);

// //   userService = inject(UserSearchService);
// //   showModalCreate = false;
// //   showModalUpdate = false;
// //   userUpdate: RegisterUser = {};
// //   pagination: Pagination = {
// //     page: 5,
// //     size: 3,
// //     sort: [],
// //   };
// //   public query = '';

// //   // public usersResults = new Array<RegisterUser>();
// //   // usersResults = signal<RegisterUser[]>([]);

// //   // APRÈS

// //   usersResults = signal<RegisterUser[]>([]);
// //   currentPage = signal<number>(0);
// //   totalItems = signal<number>(0);
// //   totalPages = signal<number>(0);

// //   searchPage: Pagination = {
// //     page: 0,
// //     size: 20,
// //     sort: ['firstName', 'ASC'],
// //   };
// //   loadingSearch = true;

// //   searchSubscription: Subscription | undefined;

// //   constructor() {}

// //   ngOnDestroy(): void {
// //     if (this.searchSubscription) {
// //       this.searchSubscription.unsubscribe();
// //     }
// //   }
// //   ngOnInit(): void {
// //     this.initSearchResultListener();
// //     this.saveUserListener();
// //     this.loadingSearch = true;
// //     const searchQuery: SearchQuery = {
// //       query: '',
// //       page: this.searchPage,
// //     };
// //     this.searchService.search(searchQuery);

// //   }

// //   // initSearchResultListener(): void {
// //   //   this.searchSubscription = this.searchService.searchResult.subscribe((usersState) => {
// //   //     if (usersState.status === 'OK' && usersState.value) {
// //   //       this.usersResults.set(usersState.value); // ✅
// //   //     } else if (usersState.status === 'ERROR') {
// //   //       this.toastService.show('Error occured when fetching search result, please try again', 'DANGER');
// //   //     }
// //   //     this.loadingSearch = false;
// //   //   });

// //   //   const searchQuery: SearchQuery = {
// //   //     query: '',
// //   //     page: this.searchPage,
// //   //   };
// //   //   this.searchService.search(searchQuery);
// //   // }
// //   initSearchResultListener(): void {
// //     this.searchSubscription = this.searchService.searchResult.subscribe((usersState) => {
// //       if (usersState.status === 'OK' && usersState.value) {
// //         const response = usersState.value;
// //         this.usersResults.set(response.users); // tableau
// //         this.currentPage.set(response.currentPage);
// //         this.totalItems.set(response.totalItems);
// //         this.totalPages.set(response.totalPages);
// //       } else if (usersState.status === 'ERROR') {
// //         this.toastService.show('Error occurred when fetching search result, please try again', 'DANGER');
// //       }
// //       this.loadingSearch = false;
// //     });
// //   }

// //   saveUserListener() {
// //     this.searchService.create.subscribe((state) => {
// //       if (state.status === 'OK') {
// //         const user = state.value;
// //         if (user) {
// //           this.toastService.show('User saved Successfully', 'SUCCESS');
// //           // this.usersResults = [user, ...this.usersResults];
// //         }
// //       } else if (state.status === 'ERROR') {
// //         this.toastService.show("Erreur lors de la création de l'utilisateur", 'DANGER');
// //       }
// //     });
// //   }
// //   // onQueryChange(newQuery: string): void {
// //   //   console.log("*********************************** change");

// //   //   this.loadingSearch = true;
// //   //   const searchQuery: SearchQuery = {
// //   //     query: newQuery,
// //   //     page: this.searchPage,
// //   //   };
// //   //   this.searchService.search(searchQuery);
// //   // }

// //   // public toggleUsers(checked: boolean) {
// //   //   this.usersResults.update((users) => {
// //   //     return users.map((user) => {
// //   //       return { ...user, selected: checked };
// //   //     });
// //   //   });
// //   // }
// //   toggleUsers(selectAll: boolean) {
// //     if (selectAll) {
// //       this.selectionService.selectAll(this.visibleUserIds);
// //     } else {
// //       this.selectionService.clearSelection();
// //     }
// //   }

// //   private handleRequestError(error: any) {
// //     const msg = 'An error occurred while fetching users. Loading dummy data as fallback.';
// //     toast.error(msg, {
// //       position: 'bottom-right',
// //       description: error.message,
// //       action: {
// //         label: 'Undo',
// //         onClick: () => console.log('Action!'),
// //       },
// //       actionButtonStyle: 'background-color:#DC2626; color:white;',
// //     });
// //   }

// //   toggleModal() {
// //     this.showModalCreate = !this.showModalCreate;
// //   }

// //   addUser(data: { user: RegisterUser; file?: File }) {
// //     if (data.file) this.searchService.saveUser(data.user, data.file);
// //   }

// //   // updateUser(data: { user: RegisterUser; file?: File }) {
// //   //   const index = this.usersResults.findIndex((u) => u.publicId === data.user.publicId);

// //   //   if (index !== -1) {
// //   //     this.usersResults[index] = { ...this.usersResults[index], ...data.user };
// //   //   }
// //   //   //appel service backend

// //   //   this.searchService.updateUser(data.user, data.file);
// //   // }
// //   updateUser(data: { user: RegisterUser; file?: File }) {
// //     this.usersResults.update((users) => {
// //       const index = users.findIndex((u) => u.publicId === data.user.publicId);
// //       if (index !== -1) {
// //         users[index] = { ...users[index], ...data.user };
// //       }
// //       return [...users];
// //     });
// //   }

// //   detailUser(user: RegisterUser) {
// //     this.showModalUpdate = true;
// //     this.userUpdate = { ...user };
// //   }

// //   // filteredUsers = computed(() => {
// //   //   const search = this.filterService.searchField().toLowerCase().trim();
// //   //   const users = this.usersResults(); // ✅ lecture signal
// //   //   if (!search) {
// //   //     return users;
// //   //   }

// //   //   return users.filter(
// //   //     (user) =>
// //   //       (user.firstName?.toLowerCase().includes(search) ?? false) ||
// //   //       (user.lastName?.toLowerCase().includes(search) ?? false) ||
// //   //       (user.email?.toLowerCase().includes(search) ?? false) ||
// //   //       (String(user.publicId).toLowerCase().includes(search) ?? false) ||
// //   //       (user.authorities?.some((auth) => auth?.toLowerCase().includes(search)) ?? false),
// //   //   );
// //   // });

// //   filteredUsers = computed(() => {
// //     const search = this.filterService.searchField().toLowerCase().trim();

// //     const users = this.usersResults(); // ✅ On récupère la valeur du signal ici

// //     if (!search) return users;
// //     return users.filter(
// //       (user) =>
// //         user.firstName?.toLowerCase().includes(search) ||
// //         user.lastName?.toLowerCase().includes(search) ||
// //         user.email?.toLowerCase().includes(search) ||
// //         String(user.publicId).toLowerCase().includes(search) ||
// //         (user.authorities?.some((auth) => auth?.toLowerCase().includes(search)) ?? false),
// //     );
// //   });

// //   // get visibleUserIds(): string[] {
// //   //   return this.filteredUsers().map((user) => user.publicId!);
// //   // }
// //   get visibleUserIds(): string[] {
// //     return this.filteredUsers().map((user: RegisterUser) => user.publicId!);
// //   }

// //   // filteredUsers = computed(() => {
// //   //   const search = this.filterService.searchField().toLowerCase();
// //   //  // const status = this.filterService.statusField();
// //   //   //const order = this.filterService.orderField();

// //   //   return this.usersResults
// //   //     .filter(
// //   //       (user) =>
// //   //         user.firstName.toLowerCase().includes(search) ||
// //   //         user.lastName.toLowerCase().includes(search) ||
// //   //         user.email.toLowerCase().includes(search) ||
// //   //         user.publicId.includes(search),
// //   //     )
// //   // .filter((user) => {
// //   //   //if (!status) return true;
// //   //   switch (status) {
// //   //     case '1':
// //   //       return user.status === 1;
// //   //     case '2':
// //   //       return user.status === 2;
// //   //     case '3':
// //   //       return user.status === 3;
// //   //     default:
// //   //       return true;
// //   //   }
// //   // })
// //   // .sort((a, b) => {
// //   //   const defaultNewest = !order || order === '1';
// //   //   if (defaultNewest) {
// //   //     return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
// //   //   } else if (order === '2') {
// //   //     return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
// //   //   }
// //   //   return 0;
// //   // });
// // }
// import { HttpClient } from '@angular/common/http';
// import { Component, computed, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { AngularSvgIconModule } from 'angular-svg-icon';
// import { TableActionComponent } from './components/table-action/table-action.component';
// import { TableFooterComponent } from './components/table-footer/table-footer.component';
// import { TableHeaderComponent } from './components/table-header/table-header.component';
// import { TableRowComponent } from './components/table-row/table-row.component';
// import { TableFilterService } from './services/table-filter.service';
// import { RegisterUser } from 'src/app/shared/models/user.model';
// import { UserSearchService } from './services/user-search.service';
// import { Pagination } from 'src/app/shared/models/request.model';
// import { ToastService } from 'src/app/shared/toast/toast.service';
// import { Subscription } from 'rxjs';
// import { SearchQuery } from './model/user-search.model';
// import { UserComponent } from 'src/app/modules/user/user.component';
// import { UserSelectionService } from './services/user-selection.service';

// @Component({
//   selector: 'app-table',
//   imports: [
//     AngularSvgIconModule,
//     FormsModule,
//     TableHeaderComponent,
//     TableFooterComponent,
//     TableRowComponent,
//     TableActionComponent,
//     UserComponent,
//   ],
//   templateUrl: './table.component.html',
//   styleUrl: './table.component.css',
// })
// export class TableComponent implements OnInit, OnDestroy {
//   http = inject(HttpClient);
//   filterService = inject(TableFilterService);
//   searchService = inject(UserSearchService);
//   selectionService = inject(UserSelectionService);
//   toastService = inject(ToastService);

//   showModalCreate = false;
//   showModalUpdate = false;
//   userUpdate: RegisterUser = {};

//   usersResults = signal<RegisterUser[]>([]);
//   currentPage = signal<number>(0);
//   totalItems = signal<number>(0);
//   totalPages = signal<number>(0);
//   loadingSearch = signal<boolean>(true);

//   searchPage: Pagination = {
//     page: 0,
//     size: 5,
//     sort: ['firstName', 'ASC'],
//   };
//   public query: string = ''; // 🔥 Solution ici

//   searchSubscription: Subscription | undefined;

//   constructor() {
//     effect(() => {
//       //const query = this.filterService.searchField().toLowerCase().trim();
//       const searchQuery: SearchQuery = {
//         query: '',
//         page: this.searchPage,
//       };
//       this.loadingSearch.set(true);
//       this.searchService.search(searchQuery);
//     });
//   }
//   ngOnDestroy(): void {
//     this.searchSubscription?.unsubscribe();
//   }

//   ngOnInit(): void {
//     this.initSearchResultListener();
//     this.saveUserListener();
//   }

//   initSearchResultListener(): void {
//     this.searchSubscription = this.searchService.searchResult.subscribe((usersState) => {
//       if (usersState.status === 'OK' && usersState.value) {
//         const response = usersState.value;
//         this.usersResults.set(response.users);
//         this.currentPage.set(response.currentPage);
//         this.totalItems.set(response.totalItems);
//         this.totalPages.set(response.totalPages);
//       } else if (usersState.status === 'ERROR') {
//         this.toastService.show('Erreur lors de la récupération des utilisateurs', 'DANGER');
//       }
//       this.loadingSearch.set(false);
//     });
//   }
//   private fromRestUser(restUser: any): RegisterUser {
//     console.log(restUser.authorities);

//     return {
//       firstName: restUser.firstname?.value,
//       lastName: restUser.lastName?.value,
//       email: restUser.email?.value,
//       imageUrl: restUser.imageUrl?.value,
//       password: '',
//       publicId: restUser.userPublicId?.value,
//       authorities: restUser.authorities?.map((a: any) => a?.name?.name ?? ''),
//       lastSeen: restUser.lastSeen,
//     };
//   }

//   saveUserListener() {
//     this.searchService.create.subscribe((state) => {
//       if (state.status === 'OK') {
//         const newUser = this.fromRestUser(state.value);
//         this.usersResults.update((users) => [newUser, ...users]);
//         this.toastService.show('Utilisateur enregistré avec succès', 'SUCCESS');
//       } else if (state.status === 'ERROR') {
//         this.toastService.show("Erreur lors de la création de l'utilisateur", 'DANGER');
//       }
//     });
//   }

//   toggleUsers(selectAll: boolean) {
//     if (selectAll) {
//       this.selectionService.selectAll(this.visibleUserIds);
//     } else {
//       this.selectionService.clearSelection();
//     }
//   }

//   toggleModal() {
//     this.showModalCreate = !this.showModalCreate;
//   }

//   addUser(data: { user: RegisterUser; file?: File }) {
//     if (data.file) this.searchService.saveUser(data.user, data.file);
//   }

//   updateUser(data: { user: RegisterUser; file?: File }) {
//     this.searchService.updateUser(data.user, data.file);
//     this.usersResults.update((users) => {
//       const index = users.findIndex((u) => u.publicId === data.user.publicId);
//       if (index !== -1) {
//         users[index] = { ...users[index], ...data.user };
//       }
//       return [...users];
//     });
//   }

//   detailUser(user: RegisterUser) {
//     this.showModalUpdate = true;
//     this.userUpdate = { ...user };
//   }

//   updateUsersResults = (fn: (users: RegisterUser[]) => RegisterUser[]) => {
//     this.usersResults.update(fn);
//   };

//   // filteredUsers = computed(() => {
//   //   return this.usersResults();
//   // });

//   filteredUsers = computed(() => {
//     const search = this.filterService.searchField().toLowerCase().trim();
//     const users = this.usersResults(); // ✅ lecture signal
//     if (!search) {
//       return users;
//     }

//     return users.filter(
//       (user) =>
//         (user.firstName?.toLowerCase().includes(search) ?? false) ||
//         (user.lastName?.toLowerCase().includes(search) ?? false) ||
//         (user.email?.toLowerCase().includes(search) ?? false) ||
//         (String(user.publicId).toLowerCase().includes(search) ?? false) ||
//         (user.authorities?.some((auth) => auth?.toLowerCase().includes(search)) ?? false),
//     );
//   });

//   get visibleUserIds(): string[] {
//     return this.filteredUsers().map((user: RegisterUser) => user.publicId!);
//   }
//   onPageChange(page: number) {
//     this.searchPage.page = page;
//     this.searchService.search({ query: this.query, page: this.searchPage });
//   }

//   onSizeChange(size: number) {
//     this.searchPage.size = size;
//     this.searchPage.page = 0; // reset to page 0
//     this.searchService.search({ query: this.query, page: this.searchPage });
//   }

//   handlePageChange(page: number): void {
//     this.searchPage.page = page;
//     this.searchService.search({
//       query: this.query,
//       page: this.searchPage,
//     });
//     this.loadingSearch.set(true);
//   }

//   handleSizeChange(size: number): void {
//     this.searchPage.size = size;
//     this.searchPage.page = 0; // on repart de la première page
//     this.searchService.search({
//       query: this.query,
//       page: this.searchPage,
//     });
//     this.loadingSearch.set(true);
//   }
// }

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
    this.searchService.create.subscribe((state) => {
      if (state.status === 'OK') {
        const newUser = this.fromRestUser(state.value);
        this.usersResults.update((users) => [newUser, ...users]);
        this.toastService.show('Utilisateur enregistré avec succès', 'SUCCESS');
      } else {
        this.toastService.show("Erreur lors de la création de l'utilisateur", 'DANGER');
      }
    });
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

  toggleModal(): void {
    this.showModalCreate = !this.showModalCreate;
  }

  addUser(data: { user: RegisterUser; file?: File }): void {
    if (data.file) this.searchService.saveUser(data.user, data.file);
  }

  updateUser(data: { user: RegisterUser; file?: File }): void {
    this.searchService.updateUser(data.user, data.file);
    this.usersResults.update((users) => {
      const i = users.findIndex((u) => u.publicId === data.user.publicId);
      if (i !== -1) users[i] = { ...users[i], ...data.user };
      return [...users];
    });
  }

  detailUser(user: RegisterUser): void {
    this.showModalUpdate = true;
    this.userUpdate = { ...user };
  }

  filteredUsers = computed(() => {
    const search = this.filterService.searchField().toLowerCase().trim();
    return this.usersResults().filter((user) =>
      [user.firstName, user.lastName, user.email, user.publicId].some((val) =>
        val?.toString().toLowerCase().includes(search)
      ) || user.authorities?.some((a) => a?.toLowerCase().includes(search))
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
}
