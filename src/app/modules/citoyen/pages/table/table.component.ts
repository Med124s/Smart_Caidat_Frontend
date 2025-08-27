import { Citizen } from 'src/app/modules/citoyen/model/citoyen.model';
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { TableCitoyenHeaderComponent } from './components/table-header/table-header.component';
import { Pagination } from 'src/app/shared/models/request.model';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { Subscription, take } from 'rxjs';
import { TableCitoyenFooterComponent } from './components/table-footer/table-footer.component';
import { TableCitoyenActionComponent } from './components/table-action/table-action.component';
import { TableFilterService } from './services/table-filter.service';
import { CitizenSearchService } from './services/citizen-search.service';
import { SearchQuery } from '../../model/citoyen-search.model';
import { TablecitizenRowComponent } from './components/table-row/table-row.component';
import { CitizenComponent } from '../modal/citizen.component';
import { CitizenSelectionService } from './services/citoyen-selection.service';

@Component({
  selector: 'app-citoyen-table',
  standalone: true,
  imports: [
    AngularSvgIconModule,
    FormsModule,
    TableCitoyenActionComponent,
    TableCitoyenFooterComponent,
    TableCitoyenHeaderComponent,
    TablecitizenRowComponent,
    CitizenComponent,
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
})
export class CitoyenTableComponent implements OnInit, OnDestroy {
  http = inject(HttpClient);
  filterService = inject(TableFilterService);
  searchService = inject(CitizenSearchService);
  selectionService = inject(CitizenSelectionService);
  toastService = inject(ToastService);

  showModalCreate = false;
  showModalUpdate = false;
  citizenUpdate: Citizen = {};

  citizenResults = signal<Citizen[]>([]);
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

  showModal() {
    this.showModalCreate = true;
  }
  ngOnInit(): void {
    this.initSearchResultListener();
    this.saveCitizenListener();
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
    this.searchService.searchCitizen(searchQuery);
  }

  initSearchResultListener(): void {
    this.searchSubscription = this.searchService.searchResult.subscribe((usersState) => {
      if (usersState.status === 'OK' && usersState.value) {
        const res = usersState.value;
        this.citizenResults.set(res.data);
        this.currentPage.set(res.currentPage);
        this.totalItems.set(res.totalItems);
        this.totalPages.set(res.totalPages);
      } else {
        this.toastService.show('Erreur lors de la récupération des citoyens', 'DANGER');
      }
      this.loadingSearch.set(false);
    });
  }

  // saveCitizenListener(): void {
  //  const sub = this.searchService.create.subscribe((state) => {
  //     if (state.status === 'OK') {
  //       // const newCitizen = this.fromRestCitizen(state);
  //       this.citizenResults.update((citizens) => [state.value!, ...citizens]);
  //       this.toastService.show('Citoyen enregistré avec succès', 'SUCCESS');
  //             // ✅ Désabonner مباشرة بعد أول save ناجح
  //       sub.unsubscribe();
  //     } else {
  //       this.toastService.show('Erreur lors de la création de citoyen', 'DANGER');
  //     }
  //   });
  // }

  saveCitizenListener(): void {
    this.searchService.create.subscribe((state) => {
      if (state.status === 'OK' && state.value) {
        this.citizenResults.update((citizens) => [state.value!, ...citizens]);
        this.toastService.show('Citoyen enregistré avec succès', 'SUCCESS');
      } else if (state.status === 'ERROR') {
        this.toastService.show('Erreur lors de la création de citoyen', 'DANGER');
      }
    });
  }

  toggleCitizens(selectAll: boolean): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    selectAll ? this.selectionService.selectAll(this.visibleCitizensIds) : this.selectionService.clearSelection();
  }

  // toggleModal(): void {
  //   this.showModalCreate = !this.showModalCreate;
  // }

  addUser(data: { citizen: Citizen; file?: File }): void {
    if (data.file) this.searchService.saveCitizen(data.citizen, data.file);
  }

  updateCitizen(data: { citizen: Citizen; file?: File }): void {
    this.searchService.updateCitizen(data.citizen, data.file);
    this.citizenResults.update((citizens) => {
      const i = citizens.findIndex((u) => u.publicId === data.citizen.publicId);
      if (i !== -1) citizens[i] = { ...citizens[i], ...data.citizen };
      return [...citizens];
    });
  }

  detailCtitizen(citizen: Citizen): void {
    this.showModalUpdate = true;
    this.citizenUpdate = { ...citizen };
  }

  filteredCitizens = computed(() => {
    const search = this.filterService.searchField().toLowerCase().trim();
    return this.citizenResults().filter((citizen) =>
      [
        citizen.firstName,
        citizen.lastName,
        citizen.email,
        citizen.publicId,
        citizen.cin,
        citizen.idcs,
        citizen.phone,
        citizen.dateBirth,
        citizen.address,
      ].some((val) => val?.toString().toLowerCase().includes(search)),
    );
  });

  get visibleCitizensIds(): string[] {
    return this.filteredCitizens().map((u) => u.publicId!);
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
  updateCitoyensResults = (fn: (users: Citizen[]) => Citizen[]) => {
    this.citizenResults.update(fn);
  };


  exportCitizensToCSV(): void {
  const citizens = this.citizenResults();

  if (!citizens || citizens.length === 0) {
    this.toastService.show('Aucun citoyen à exporter', 'DANGER');
    return;
  }

  // Colonnes CSV
  const header = [
    'firstName',
    'lastName',
    'email',
    'cin',
    'idcs',
    'phone',
    'address',
    'maritalStatus',
    'dateBirth',
    'gender',
  ];

  // Construire CSV
  const csvRows: string[] = [];
  csvRows.push(header.join(','));

  for (const citizen of citizens) {
    const row = [
      citizen.firstName,
      citizen.lastName,
      citizen.email,
      citizen.cin,
      citizen.idcs,
      citizen.phone,
      citizen.address,
      citizen.maritalStatus,
      citizen.dateBirth,
      citizen.gender,
    ].map((field) => `"${(field ?? '').toString().replace(/"/g, '""')}"`);
    csvRows.push(row.join(','));
  }

  const csvString = csvRows.join('\n');

  // Télécharger le fichier
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = 'citoyens.csv';
  link.click();
  URL.revokeObjectURL(url);

  this.toastService.show('Export CSV réussi', 'SUCCESS');
}

}
