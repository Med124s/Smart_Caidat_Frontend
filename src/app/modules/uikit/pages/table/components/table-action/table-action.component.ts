import { Component, inject, Input, Signal, Output, EventEmitter } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { TableFilterService } from '../../services/table-filter.service';
import { UserSelectionService } from '../../services/user-selection.service';
import { UserSearchService } from '../../services/user-search.service';
import { RegisterUser } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-table-action',
  imports: [AngularSvgIconModule],
  templateUrl: './table-action.component.html',
  styleUrl: './table-action.component.css',
})
export class TableActionComponent {
  filterService = inject(TableFilterService);

  selectionService = inject(UserSelectionService);
  userService = inject(UserSearchService);
  @Input() usersResults!: Signal<RegisterUser[]>; // 👈 signal
  @Input() selectedIds!: string[];
  @Input() totalItems!: number;
  @Input() size!: number;
  @Output() deleteSelected = new EventEmitter<any[]>();
  @Output() filter = new EventEmitter<any>(); // si tu veux un événement global pour tous les filtres

  @Input() selectedUser: RegisterUser[] = [];

  @Input() updateUsersResults!: (fn: (users: RegisterUser[]) => RegisterUser[]) => void;

  constructor() {
    // effect(() => this.listenToDeleteResult());
  }

  deleteSelectedUsers() {
    console.log(this.selectionService.getSelectedIds());
    if (this.selectionService.getSelectedIds()) {
      this.deleteSelected.emit(this.selectionService.getSelectedIds());
    }
  }

  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.filter.emit(input.value);
  }







  // onSearchChange(value: Event) {
  //   const input = value.target as HTMLInputElement;
  //   console.log(input.value);

  //   this.filterService.searchField.set(input.value);
  // }

  // // ngOnInit(): void {
  // //   // this.deleteUserListner();
  // // }

  // deleteSelectedUsers() {
  //   const ids = Array.from(this.selectionService.getSelectedIds());

  //   if (ids.length === 0) {
  //     Swal.fire({
  //       icon: 'warning',
  //       title: 'Aucun utilisateur sélectionné',
  //       text: 'Veuillez sélectionner au moins un utilisateur.',
  //       confirmButtonText: 'OK',
  //       confirmButtonColor: '#3085d6',
  //     });
  //     return;
  //   }

  //   Swal.fire({
  //     title: `Voulez-vous supprimer ${ids.length} utilisateur(s) ?`,
  //     text: 'Cette action est irréversible.',
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonColor: '#dc2626', // rouge (danger)
  //     cancelButtonColor: '#6b7280', // gris (neutre)
  //     confirmButtonText: 'Oui, supprimer',
  //     cancelButtonText: 'Annuler',
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       this.userService.deleteUsersBulk(ids);
  //     }
  //   });
  // }

  // listenToDeleteResult() {
  //   this.userService.delete.subscribe((state) => {
  //     if (state.status === 'OK') {
  //       const deletedIds = state.value as string[]; // tableau d'IDs supprimés

  //       // 🔥 Supprimer localement les utilisateurs
  //       this.updateUsersResults((users) => users.filter((user) => !deletedIds.includes(user.publicId!)));

  //       Swal.fire({
  //         icon: 'success',
  //         title: 'Suppression réussie',
  //         text: `${state.value}`,
  //         confirmButtonColor: '#22c55e',
  //       });
  //       this.selectionService.clearSelection();
  //     } else if (state.status === 'ERROR') {
  //       Swal.fire({
  //         icon: 'error',
  //         title: 'Erreur de suppression',
  //         text: `${state.value || 'Impossible de supprimer les utilisateurs'}`,
  //         confirmButtonColor: '#ef4444',
  //       });
  //     }
  //   });
  // }

  // onStatusChange(value: Event) {
  //   const selectElement = value.target as HTMLSelectElement;
  //   this.filterService.statusField.set(selectElement.value);
  // }

  // onOrderChange(value: Event) {
  //   const selectElement = value.target as HTMLSelectElement;
  //   this.filterService.orderField.set(selectElement.value);
  // }
}
