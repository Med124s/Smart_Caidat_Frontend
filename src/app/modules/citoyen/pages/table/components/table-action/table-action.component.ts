import { Component, inject, effect, Input, Signal } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { TableFilterService } from '../../services/table-filter.service';
import Swal from 'sweetalert2';
import { CitizenSelectionService } from '../../services/citoyen-selection.service';
import { Citizen } from 'src/app/modules/citoyen/model/citoyen.model';
import { CitizenSearchService } from '../../services/citizen-search.service';

@Component({
  selector: 'app-citoyen-table-action',
  imports: [AngularSvgIconModule],
  templateUrl: './table-action.component.html',
  styleUrl: './table-action.component.css',
})
export class TableCitoyenActionComponent {
  filterService = inject(TableFilterService);
  selectionService = inject(CitizenSelectionService);
  citizenService = inject(CitizenSearchService);
  @Input() citizenResults!: Signal<Citizen[]>; // 👈 signal
  @Input() updateCitizenResults!: (fn: (citizens: Citizen[]) => Citizen[]) => void;
  @Input() size!:number;
  @Input() totalItems!:number;

  constructor() {
    effect(() => this.listenToDeleteResult());
  }
  onSearchChange(value: Event) {
    const input = value.target as HTMLInputElement;
    console.log(input.value);

    this.filterService.searchField.set(input.value);
  }

  deleteSelectedCitizens() {
    const ids = Array.from(this.selectionService.getSelectedIds());

    if (ids.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Aucun utilisateur sélectionné',
        text: 'Veuillez sélectionner au moins un utilisateur.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3085d6',
      });
      return;

    }

    Swal.fire({
      title: `Voulez-vous supprimer ${ids.length} utilisateur(s) ?`,
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626', // rouge (danger)
      cancelButtonColor: '#6b7280', // gris (neutre)
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
    }).then((result) => {
      if (result.isConfirmed) {
        this.citizenService.deletecitizenBulk(ids);
      }
    });
  }

  listenToDeleteResult() {
    this.citizenService.delete.subscribe((state) => {
      if (state.status === 'OK') {
        const deletedIds = state.value as string[]; // tableau d'IDs supprimés
         
        // 🔥 Supprimer localement les Citoyens
        this.updateCitizenResults((citizens) => citizens.filter((citizen) => !deletedIds.includes(citizen.publicId!)));
        Swal.fire({
          icon: 'success',
          title: 'Suppression réussie',
          text: `le citoyen supprimer`,
          confirmButtonColor: '#22c55e',
        });
        this.selectionService.clearSelection();
      } else if (state.status === 'ERROR') {
        Swal.fire({
          icon: 'error',
          title: 'Erreur de suppression',
          text: `${state.value || 'Impossible de supprimer les citoyens'}`,
          confirmButtonColor: '#ef4444',
        });
      }
    });
  }
  // onStatusChange(value: Event) {
  //   const selectElement = value.target as HTMLSelectElement;
  //   this.filterService.statusField.set(selectElement.value);
  // }

  // onOrderChange(value: Event) {
  //   // const selectElement = value.target as HTMLSelectElement;
  //   // this.filterService.orderField.set(selectElement.value);
  // }
}
