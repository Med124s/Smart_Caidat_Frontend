import { DatePipe, NgClass, SlicePipe, NgIf } from '@angular/common';
import { Component, EventEmitter, HostListener, inject, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import dayjs from 'dayjs';
import { map, Observable } from 'rxjs';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { RequestSelectionService } from '../../services/request_docs-selection.service';
import { RequestService } from '../../services/request-docs.service';
import { RequestDocument, RequestStatus, RequestType } from '../../../../model/request.model';
import { PrettyTypePipe } from 'src/app/shared/pipes/PrettyTypePipe';
import { State } from 'src/app/shared/models/state.model';
import { ConnectedUser } from 'src/app/shared/models/user.model';
import { Oauth2AuthService } from 'src/app/modules/auth/oauth2-auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: '[app-request-table-row]',
  imports: [FormsModule, AngularSvgIconModule, DatePipe, NgClass, SlicePipe, PrettyTypePipe, NgIf],
  templateUrl: './table-row.component.html',
  styleUrl: './table-row.component.css',
})
export class TableRequestRowComponent implements OnInit {
  @Input() selectedRequests: RequestDocument[] = [];

  // @Input() request: RequestDocument | any;

  private _request!: RequestDocument | any;
  toastService = inject(ToastService);
  @Input()
  set request(value: RequestDocument | any) {
    this._request = value;
    this.updateCounterDoc();
  }

  get request() {
    return this._request;
  }

  updateCounterDoc() {
    this.counterDoc = this._request?.documentUrl && this._request.status?.value === this.RequestStatus.APPROVED ? 1 : 0;
  }

  @Input() requestIds: string[] = [];
  @Output() onDeleteSelected = new EventEmitter<RequestDocument[]>();
  @Output() detailRequest = new EventEmitter<RequestDocument>();
  @Output() onUpdateStatus = new EventEmitter<{ request: RequestDocument; newStatus: RequestStatus }>();

  RequestStatus = RequestStatus;
  selection = inject(RequestSelectionService);
  selectionService = inject(RequestSelectionService);
  showDocumentsModal: boolean = false;
  requestService = inject(RequestService);
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

    if (this.request.documentUrl && this.request?.status['value'] === RequestStatus.APPROVED) {
      this.counterDoc = 1;
    } else {
      this.counterDoc = 0;
    }
    this.isSelected$ = this.selectionService.selectedRequest$.pipe(
      map((set: Set<string>) => set.has(this.request.publicId!)),
    );
  }

  isSelected(): boolean {
    return this.selectionService.isSelected(this.request.publicId!);
  }

  @HostListener('click', ['$event'])
  onRowClick(event: MouseEvent) {
    // Si le clic vient d'un checkbox, on ignore
    if ((event.target as HTMLElement).closest('input[type="checkbox"]')) {
      return; // ne fait rien
    }
    // sinon, ouvre le modal
    this.detailRequest.emit(this.request);
  }

  toggleSelection(event: Event) {
    event.stopPropagation();

    this.selectionService.toggleSelection(this.request.publicId!);
    // optionnel : si tu veux notifier le parent à chaque sélection/désélection
    this.selectionChange.emit(this.request.publicId);
  }
  formatLastSeen(value?: any): string {
    if (!value) return '';
    return dayjs(value).format('DD/MM/YYYY HH:mm');
  }

  closeDocuments() {
    this.showDocumentsModal = false;
  }

  openStatusMenu(request: any, event: Event) {
    event.stopPropagation();
  }
  openMenuId: string | null = null;

  toggleMenu(requestId: string, event: Event) {
    event.stopPropagation();
    this.openMenuId = this.openMenuId === requestId ? null : requestId;
  }

  updateStatus(request: RequestDocument, newStatus: RequestStatus, event: Event) {
    event.stopPropagation();
    if (request.documentUrl && newStatus === RequestStatus.REJECTED) {
      this.requestService.clearRequestDocument(request.publicId!).subscribe({
        next: (res) => {
          request.documentUrl = null;
          this.updateCounterDoc();

          console.log('Document cleared', res);
        },
        error: (err) => console.error('Clear error', err),
      });
    }
    this.onUpdateStatus.emit({ request, newStatus });
    this.openMenuId = null; // fermer le menu après action
  }

  // 👁 Voir documents
  openDocuments(request: any, event: Event) {
    event.stopPropagation();
    if (request.documentUrl) {
      // Récupérer juste le nom du fichier
      const filename = request.documentUrl.split('/').pop();
      const url = `${environment.API_URL}/requests/uploads/requests/${filename}`;
      window.open(url, '_blank');
    } else {
      this.toastService.show('⚠️ Aucun document disponible', 'WARNING');
    }
  }

  // 📥 Télécharger document
  // downloadDocument(request: any, event: Event) {
  //   event.stopPropagation();
  //   if (this.request.documentUrl && this.request?.status['value'] === RequestStatus.APPROVED) {
  //     alert('Already has document');
  //     return;
  //   }

  //   this.http
  //     .get(`${environment.API_URL}/requests/${request.publicId}/document`, { responseType: 'blob' })
  //     .subscribe((blob) => {
  //       const url = window.URL.createObjectURL(blob);
  //       const a = document.createElement('a');
  //       a.href = url;
  //       a.download = `document-${request.publicId}.pdf`;
  //       a.click();
  //       window.URL.revokeObjectURL(url);
  //     });
  // }
  // Génirer Certificat
  generateCertificate(request: any, event: Event) {
    event.stopPropagation();

    if (request.type != RequestType.CERTIFICAT_VIE) {
      this.toastService.show('⚠️ Type de demande incompatible', 'WARNING');
      return;
    }
    if (request.documentUrl) {
      this.toastService.show('⚠️ Certificat déjà disponible.', 'WARNING');
      return;
    }
    if (request.status?.value !== 'APPROVED') {
      this.toastService.show('⚠️ La demande doit être approuvée.', 'WARNING');
      return;
    }

    const validatorId = this.currentUser?.publicId; // si tu veux transmettre

    this.requestService.generateLifeCertificate(request.publicId, validatorId).subscribe({
      next: (res) => {
        if (res.documentUrl) {
          request.documentUrl = res.documentUrl; // ✅ mise à jour réactive
          this.counterDoc = 1; // badge
          this.toastService.show('✅ Certificat généré et attaché', 'SUCCESS');
        } else {
          this.toastService.show('⚠️ Certificat généré mais URL introuvable', 'DANGER');
        }
      },
      error: (err) => {
        console.error(err);
        this.toastService.show('❌ Erreur lors de la génération', 'DANGER');
      },
    });
  }

  // 📄 Générer certificat
  // generateCertificate(request: any, event: Event) {
  //   event.stopPropagation();

  //   this.http.get(`/api/requests/${request.publicId}/certificate`, { responseType: 'blob' }).subscribe((blob) => {
  //     const url = window.URL.createObjectURL(blob);
  //     const a = document.createElement('a');
  //     a.href = url;
  //     a.download = `certificat-${request.publicId}.pdf`;
  //     a.click();
  //     window.URL.revokeObjectURL(url);
  //   });
  // }
  // ⬆️ Upload documents

  // 2

  // uploadDocuments(request: any, event: Event) {
  //   event.stopPropagation();
  //   if (this.request.documentUrl && this.request?.status['value'] === RequestStatus.APPROVED) {
  //     alert('Already has document');
  //     return;
  //   }
  //   // Vérifier si le document est approuvé
  //   if (request.status?.value !== 'APPROVED') {
  //     alert('Le document doit être approuvé pour pouvoir uploader un fichier.');
  //     return;
  //   }
  //   const input = document.createElement('input');
  //   input.type = 'file';
  //   input.accept = 'application/pdf,image/*';
  //   input.onchange = () => {
  //     if (!input.files || input.files.length === 0) return;
  //     this.requestService.updateRequestWithFile(request.publicId!, input.files[0]).subscribe({
  //       next: (res) => {
  //         this.counterDoc = 1;
  //         // this.request.documentUrl = res
  //         console.log('Document cleared', res);
  //         alert('Document uploadé avec succès ✅');
  //       },
  //       error: (err) => console.error('Clear error', err),
  //     });
  //   };
  //   input.click();
  // }

  uploadDocuments(request: any, event: Event) {
    event.stopPropagation();

    if (request.documentUrl) {
      this.toastService.show('A déjà un document', 'WARNING');
      return;
    }

    if (request.status?.value !== 'APPROVED') {
      this.toastService.show('Le document doit être approuvé pour pouvoir uploader un fichier.', 'WARNING');
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf,image/*';

    input.onchange = () => {
      if (!input.files || input.files.length === 0) return;

      this.requestService.updateRequestWithFile(request.publicId!, input.files[0]).subscribe({
        next: (res: any) => {
          request.documentUrl = res.documentUrl; // Mettre à jour la propriété
          this.updateCounterDoc(); // Mettre à jour le badge automatiquement
          this.toastService.show('Document uploadé avec succès ✅', 'SUCCESS');
        },
        error: (err) => console.error('Upload error', err),
      });
    };

    input.click();
  }

  clearDocument(request: any) {
    if (!request.documentUrl) return;

    if (confirm('Êtes-vous sûr de vouloir rejeter cette demande ?')) {
      this.requestService.clearRequestDocument(request.publicId!).subscribe({
        next: () => {
          request.documentUrl = null;
          this.updateCounterDoc();
          alert('Document supprimé ✅');
        },
        error: (err) => console.error('Clear error', err),
      });
    }
  }
}
