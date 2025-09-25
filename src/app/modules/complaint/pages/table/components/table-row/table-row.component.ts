import { DatePipe, NgClass, SlicePipe, NgIf } from '@angular/common';
import { Component, EventEmitter, HostListener, inject, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import dayjs from 'dayjs';
import { map, Observable } from 'rxjs';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { State } from 'src/app/shared/models/state.model';
import { ConnectedUser } from 'src/app/shared/models/user.model';
import { Oauth2AuthService } from 'src/app/modules/auth/oauth2-auth.service';
import { HttpClient } from '@angular/common/http';
import { Complaint, ComplaintStatus, ComplaintTypeLabel } from 'src/app/modules/complaint/model/complaint.model';
import { ComplaintSelectionService } from '../../services/complaint-selection.service';
import { ComplaintService } from '../../services/complaint.service';
import { PrettyComplaintTypePipe } from 'src/app/shared/pipes/PrettyComplaintTypePipe';
import Swal from 'sweetalert2';

@Component({
  selector: '[app-complaints-table-row]',
  imports: [FormsModule, AngularSvgIconModule, DatePipe, NgClass, SlicePipe, PrettyComplaintTypePipe, NgIf, NgClass],
  templateUrl: './table-row.component.html',
  styleUrl: './table-row.component.css',
})
export class TableComplaintsRowComponent implements OnInit {
  @Input() selectedcomplaints: Complaint[] = [];

  // @Input() complaint: Complaint | any;
  ComplaintTypeLabel = ComplaintTypeLabel;
  private _complaint!: Complaint | any;
  toastService = inject(ToastService);
  @Input()
  set complaint(value: Complaint | any) {
    this._complaint = value;
    this.updateCounterDoc();
  }

  get complaint() {
    return this._complaint;
  }

  updateCounterDoc() {
    this.counterDoc =
      this._complaint?.documentUrl && this._complaint.status?.value === this.ComplaintStatus.RESOLVED ? 1 : 0;
  }

  @Input() complaintIds: string[] = [];
  @Output() onDeleteSelected = new EventEmitter<Complaint[]>();
  @Output() detailcomplaint = new EventEmitter<Complaint>();
  @Output() aboutComplaint = new EventEmitter<Complaint>();
  @Output() onUpdateStatus = new EventEmitter<{
    complaint: Complaint;
    newStatus: ComplaintStatus;
    reason: string | undefined;
  }>();

  ComplaintStatus = ComplaintStatus;
  selection = inject(ComplaintSelectionService);
  selectionService = inject(ComplaintSelectionService);
  showDocumentsModal: boolean = false;
  complaintService = inject(ComplaintService);
  //@Input() selectedIds: string[] = []; // ✅ ids sélectionnés envoyés du parent
  @Output() selectionChange = new EventEmitter<string>();
  isSelected$!: Observable<boolean>;
  selectedDocuments: Document[] = [];
  oauth2Auth = inject(Oauth2AuthService);
  http = inject(HttpClient);
  counterDoc = 0;
  selected = false;
  canChangeStatus = false;

  constructor() {}
  currentUser: ConnectedUser | null = null;
  ngOnInit() {
    const state: State<ConnectedUser> = this.oauth2Auth.fetchUser();

    if (state.status === 'OK' && state.value) {
      this.currentUser = state.value;
    }
    this.canChangeStatus = this.currentUser?.authorities?.includes('ROLE_ADMIN') ?? false;

    // if (this.complaint.documentUrl && this.complaint?.status['value'] === ComplaintStatus.RESOLVED) {
    //   this.counterDoc = 1;
    // } else {
    //   this.counterDoc = 0;
    // }
    this.isSelected$ = this.selectionService.selectedcomplaint$.pipe(
      map((set: Set<string>) => set.has(this.complaint.publicId!)),
    );
  }

  isSelected(): boolean {
    return this.selectionService.isSelected(this.complaint.publicId!);
  }

  @HostListener('click', ['$event'])
  onRowClick(event: MouseEvent) {
    // Si le clic vient d'un checkbox, on ignore
    if ((event.target as HTMLElement).closest('input[type="checkbox"]')) {
      return; // ne fait rien
    }
    // sinon, ouvre le modal
    this.aboutComplaint.emit(this.complaint);
  }

  toggleSelection(event: Event) {
    event.stopPropagation();

    this.selectionService.toggleSelection(this.complaint.publicId!);
    // optionnel : si tu veux notifier le parent à chaque sélection/désélection
    this.selectionChange.emit(this.complaint.publicId);
  }
  formatLastSeen(value?: any): string {
    if (!value) return '';
    return dayjs(value).format('DD/MM/YYYY HH:mm');
  }

  closeDocuments() {
    this.showDocumentsModal = false;
  }

  openStatusMenu(complaint: any, event: Event) {
    event.stopPropagation();
  }
  openMenuId: string | null = null;

  toggleMenu(complaintId: string, event: Event) {
    event.stopPropagation();
    this.openMenuId = this.openMenuId === complaintId ? null : complaintId;
  }

  updateStatus(complaint: Complaint, newStatus: ComplaintStatus, event: Event) {
    event.stopPropagation();

    if (newStatus) {
      // ✅ Popup avec input texte (optionnel)
      Swal.fire({
        title: 'Raison',
        text: 'Vous pouvez entrer une remarque (optionnel)',
        input: 'text',
        inputPlaceholder: 'Ex: Non conforme',
        showCancelButton: true,
        confirmButtonText: 'Valider',
        cancelButtonText: 'Annuler',
        customClass: {
          input: 'swal-input-custom', // ajoute une classe à l’input
          // confirmButton: 'swal-btn-confirm',
          // cancelButton: 'swal-btn-cancel',
        },
      }).then((result) => {
        if (result.isConfirmed) {
          const reason = result.value || undefined; // undefined si vide
          this.onUpdateStatus.emit({ complaint, newStatus, reason });
          this.openMenuId = null;
        }
      });
    } else {
      // ✅ Pour les autres statuts, pas besoin de raison
      const reason = undefined;
      this.onUpdateStatus.emit({ complaint, newStatus, reason });
      this.openMenuId = null;
    }


  }
  updateComplaint(event: Event) {
    event.stopPropagation();
    this.detailcomplaint.emit(this.complaint);
  }
}
