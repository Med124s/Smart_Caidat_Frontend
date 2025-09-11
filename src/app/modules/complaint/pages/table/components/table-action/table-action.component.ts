import { Component, EventEmitter, inject, Input, OnInit, Output, Signal } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { ConnectedUser } from 'src/app/shared/models/user.model';
import { State } from 'src/app/shared/models/state.model';
import { Oauth2AuthService } from 'src/app/modules/auth/oauth2-auth.service';
import { ComplaintService } from '../../services/complaint.service';
import { Complaint, ComplaintPriority, ComplaintPriorityLabel, ComplaintStatus, ComplaintStatusLabel, ComplaintType, ComplaintTypeLabel } from 'src/app/modules/complaint/model/complaint.model';
import { TableFilterService } from '../../services/table-complaint-services';
import { ComplaintSelectionService } from '../../services/complaint-selection.service';

@Component({
  selector: 'app-complaints-table-action',
  imports: [AngularSvgIconModule],
  templateUrl: './table-action.component.html',
  styleUrl: './table-action.component.css',
})
export class TableComplaintsActionComponent implements OnInit {
  filterService = inject(TableFilterService);
  complaintService = inject(ComplaintService);
  selection = inject(ComplaintSelectionService);
  @Input() complaintResults!: Signal<Complaint[]>; // 👈 signal
  @Input() updatecomplaintResults!: (fn: (complaints: Complaint[]) => Complaint[]) => void;
  @Input() size!: number;
  @Input() totalItems!: number;
  toastService = inject(ToastService);

  @Input() selectedIds!: string[];
  @Output() delete = new EventEmitter<void>();
  @Input() selectedcomplaints: Complaint[] = [];
  @Output() deleteSelected = new EventEmitter<any[]>();
  @Output() search = new EventEmitter<string>();
  @Output() startDateChange = new EventEmitter<string>();
  @Output() endDateChange = new EventEmitter<string>();
  @Output() filter = new EventEmitter<any>(); // si tu veux un événement global pour tous les filtres

  // Filtres locaux
filters: any = {
  type: '',
  title: '',
  status: '',
  description: '',
  priority: '',
  citizenCin: '',
  globalSearch: ''
};

  filterStatType = {
    type: '',
    status: '',
    priority:''
  };

    ComplaintStatus = ComplaintStatus;
    ComplaintStatusLabel = ComplaintStatusLabel;
    ComplaintPriority = ComplaintPriority;
    ComplaintPriorityLabel = ComplaintPriorityLabel;
    ComplaintType = ComplaintType;
    ComplaintTypeLabel = ComplaintTypeLabel;

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

  deleteSelectedcomplaints() {
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
onPriorityChange(event: Event) {
  const priority = event.target as HTMLInputElement;
  this.filters.priority = priority.value;
  console.log(this.filters.priority);
  
  this.emitFilters();
}

emitFilters() {
  this.filter.emit(this.filters);
  // تحديث service (اختياري)
  this.filterService.typeField.set(this.filters.type);
  this.filterService.statusField.set(this.filters.status);
  this.filterService.priorityField.set(this.filters.priority);
  this.filterService.searchField.set(this.filters.globalSearch);
}
}
