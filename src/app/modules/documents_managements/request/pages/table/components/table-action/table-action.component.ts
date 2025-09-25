import { NgFor } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output, Signal } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { TableFilterService } from '../../services/table-request-services';
import { RequestService } from '../../services/request-docs.service';
import { RequestSelectionService } from '../../services/request_docs-selection.service';
import { RequestDocument, RequestStatus, RequestType } from '../../../../model/request.model';
import { ConnectedUser } from 'src/app/shared/models/user.model';
import { State } from 'src/app/shared/models/state.model';
import { Oauth2AuthService } from 'src/app/modules/auth/oauth2-auth.service';

@Component({
  selector: 'app-request-table-action',
  imports: [AngularSvgIconModule, NgFor],
  templateUrl: './table-action.component.html',
  styleUrl: './table-action.component.css',
})
export class TableRequestActionComponent implements OnInit {
  filterService = inject(TableFilterService);
  requestService = inject(RequestService);
  selection = inject(RequestSelectionService);
  @Input() RequestResults!: Signal<Request[]>; // 👈 signal
  @Input() updateRequestResults!: (fn: (Requests: Request[]) => Request[]) => void;
  @Input() size!: number;
  @Input() totalItems!: number;
  toastService = inject(ToastService);

  @Input() selectedIds!: string[];
  @Output() delete = new EventEmitter<void>();
  @Input() selectedRequests: RequestDocument[] = [];
  @Output() deleteSelected = new EventEmitter<any[]>();
  @Output() search = new EventEmitter<string>();
  @Output() startDateChange = new EventEmitter<string>();
  @Output() endDateChange = new EventEmitter<string>();
  @Output() filter = new EventEmitter<any>(); // si tu veux un événement global pour tous les filtres

  // Filtres locaux
filters: any = {
  type: '',
  status: '',
  description: '',
  motif: '',
  citizenCin: '',
  globalSearch: ''
};

  filterStatType = {
    type: '',
    status: ''
  };

  requestTypes: any[] = [
    { label: 'Certificat de vie', value: RequestType.CERTIFICAT_VIE },
    { label: 'Certificat de marriage', value: RequestType.CERTIFICAT_MARITAL },
    { label: 'Certificat de décès', value: RequestType.CERTIFICAT_DECES },
    { label: 'certificat de residence', value: RequestType.CERTIFICAT_RESIDENCE },
  ];
  statuses: any[] = [
    { label: 'Approuvée', value: RequestStatus.APPROVED },
    { label: 'Rejetée', value: RequestStatus.REJECTED },
    { label: 'En attente', value: RequestStatus.PENDING },
  ];

  oauth2Auth = inject(Oauth2AuthService);

  constructor() {}

  canChangeStatus = false;

  currentUser: ConnectedUser | null = null;
  ngOnInit() {
    const state: State<ConnectedUser> = this.oauth2Auth.fetchUser();

    if (state.status === 'OK' && state.value) {
      this.currentUser = state.value;
    }
    this.canChangeStatus = this.currentUser?.authorities?.includes('ROLE_ADMIN') ?? false;
  }

  deleteSelectedRequests() {
   console.log(this.selection.getSelectedIds());
    if (this.selection.getSelectedIds()) {
      this.deleteSelected.emit(this.selection.getSelectedIds());
    }
  }


onSearchChange(event: Event) {
  const input = event.target as HTMLInputElement;

  
  this.filters.globalSearch = input.value;
  this.emitFilters();
}

onTypeChange(event: Event) {
  const type = event.target as HTMLInputElement;
  this.filters.type = type.value
  this.emitFilters();
}

onStatusChange(event: Event) {
  const status = event.target as HTMLInputElement;
  this.filters.status = status.value;
  console.log(this.filters.status);
  
  this.emitFilters();
}

emitFilters() {
  this.filter.emit(this.filters);

  // تحديث service (اختياري)
  this.filterService.typeField.set(this.filters.type);
  this.filterService.statusField.set(this.filters.status);
  this.filterService.searchField.set(this.filters.globalSearch);
}
}
