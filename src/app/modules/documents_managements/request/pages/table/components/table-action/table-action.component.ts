import { Component, EventEmitter, inject, Input, OnInit, Output, Signal } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { TableFilterService } from '../../services/table-request-services';
import { RequestService } from '../../services/request-docs.service';
import { RequestSelectionService } from '../../services/request_docs-selection.service';
import { RequestDocument } from '../../../../model/request.model';
import { ConnectedUser } from 'src/app/shared/models/user.model';
import { State } from 'src/app/shared/models/state.model';
import { Oauth2AuthService } from 'src/app/modules/auth/oauth2-auth.service';

@Component({
  selector: 'app-request-table-action',
  imports: [AngularSvgIconModule],
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

  filters: any = {
    title: '',
    startDate: '',
    endDate: '',
  };

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

  onSearchChange(value: Event) {
    const input = value.target as HTMLInputElement;
     this.filters.title = input.value;
    // console.log(input.value);
    this.search.emit( this.filters.title)
    this.filterService.searchField.set( this.filters.title);
  }

  onStartDateChange(event: any) {
    this.filters.startDate = event.target.value;
    this.startDateChange.emit(this.filters.startDate);
  }

  onEndDateChange(event: any) {
    this.filters.endDate = event.target.value;
    this.endDateChange.emit(this.filters.endDate);
  }
  deleteSelectedRequests() {
    console.log(this.selection.getSelectedIds());
    if (this.selection.getSelectedIds()) {
      this.deleteSelected.emit(this.selection.getSelectedIds());
    }
  }
}
