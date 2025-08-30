import { RequestStatus } from './../../../../../../../../../.history/src/app/modules/documents_managements/request/model/request.model_20250827040557';
import { AsyncPipe, DatePipe, LowerCasePipe, NgClass, SlicePipe, NgIf } from '@angular/common';
import { Component, EventEmitter, HostListener, inject, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import dayjs from 'dayjs';
import { Observable } from 'rxjs';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { RequestSelectionService } from '../../services/request_docs-selection.service';
import { RequestService } from '../../services/request-docs.service';
import { RequestDocument } from '../../../../model/request.model';
import { PrettyTypePipe } from 'src/app/shared/pipes/PrettyTypePipe';
import { State } from 'src/app/shared/models/state.model';
import { ConnectedUser } from 'src/app/shared/models/user.model';
import { Oauth2AuthService } from 'src/app/modules/auth/oauth2-auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: '[app-request-table-row]',
  imports: [FormsModule, AngularSvgIconModule, AsyncPipe, DatePipe, NgClass, SlicePipe, PrettyTypePipe, NgIf],
  templateUrl: './table-row.component.html',
  styleUrl: './table-row.component.css',
})
export class TableRequestRowComponent implements OnInit {
  @Input() selectedRequests: RequestDocument[] = [];

  @Input() request: RequestDocument | any;
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
  minioBaseUrl = 'https://minio.example.com/bucket-name/'; // ou dynamiquement
  toastService = inject(ToastService);
  oauth2Auth = inject(Oauth2AuthService);
  http = inject(HttpClient);

  // ngOnInit(): void {
  //   // this.isSelected$ = this.selectionService.selectedRequests$.pipe(
  //   //   map((set: Set<string>) => set.has(this.Request.publicId!)),
  //   // );

  //   // console.log("____________");
  //   // console.log(this.Request);
  //   console.log('hhey');
  // }

  canChangeStatus = false;

  currentUser: ConnectedUser | null = null;
  ngOnInit() {
    const state: State<ConnectedUser> = this.oauth2Auth.fetchUser();

    if (state.status === 'OK' && state.value) {
      this.currentUser = state.value;
    }
    this.canChangeStatus = this.currentUser?.authorities?.includes('ROLE_ADMIN') ?? false;
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

  isSelected(): boolean {
    return this.selectionService.isSelected(this.request.publicId!);
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

  // openDocuments(Request: Request) {
  //   // event.stopPropagation();
  //   if (!Request.publicId) return;
  //   this.RequestService.getDocumentsByRequest(Request.publicId).subscribe({
  //     next: (docs:any[]) => {
  //       this.selectedDocuments = docs.map((doc:any) => ({
  //         ...doc,
  //         fileUrl: doc.storageType === 'MINIO' ? `${this.minioBaseUrl}${doc.fileName}` : `assets/files/${doc.fileName}`,
  //       }));
  //     },
  //     error: () => this.toastService.show('❌ Impossible de charger les documents', 'DANGER'),
  //   });
  //   this.showDocumentsModal = true;
  // }

  // openDocuments(request: RequestDocument, event: Event) {
  //   event.stopPropagation();
  //   if (!request.publicId) return;

  //   // this.requestService.getDocumentsByRequest(request.publicId).subscribe((state) => {
  //   //   if (state.status === 'INIT') {
  //   //     console.log("⏳ Chargement...");
  //   //   }

  //   //   if (state.error) {
  //   //     this.toastService.show('❌ Impossible de charger les documents', 'DANGER');
  //   //   }

  //   //   if (state.status === "OK" &&  state.value ) {
  //   //     this.selectedDocuments = state.value?.map((doc: any) => ({
  //   //       ...doc,
  //   //       fileUrl:
  //   //         doc.storageType === 'MINIO'
  //   //           ? `${this.minioBaseUrl}${doc.fileName}`
  //   //           : `assets/files/${doc.fileName}`,
  //   //     }));
  //   //     this.showDocumentsModal = true;
  //   //   }
  //   // });
  // }

  closeDocuments() {
    this.showDocumentsModal = false;
  }

  openStatusMenu(request: any, event: Event) {
    event.stopPropagation();
  }
  openMenuId: string | null = null;

  toggleMenu(requestId: string) {
    this.openMenuId = this.openMenuId === requestId ? null : requestId;
  }

  // updateStatus(request: RequestDocument, newStatus: RequestStatus) {

  //   this.onUpdateStatus.emit(request, newStatus)
  //   if (!request.publicId || !this.currentUser) {
  //     this.toastService.show('❌ Impossible de changer le statut', 'DANGER');
  //     return;
  //   }
  //   // نستخدم service خاص بـ updateStatus
  //   this.requestService.updateStatus(request.publicId, newStatus, this.currentUser.publicId).subscribe((state) => {
  //     if (state.status === 'OK' && state.value) {
  //       // تحديث الـrow مباشرة
  //       request.status = state.value.status;
  //       request.validatorPublicId = state.value.validatorPublicId;
  //       request.validationDate = state.value.validationDate;

  //       this.toastService.show(`✅ Statut mis à jour: ${newStatus}`, 'SUCCESS');
  //       this.openMenuId = null; // fermer le menu
  //     } else {
  //       this.toastService.show(`❌ Erreur lors du changement de statut`, 'DANGER');
  //       console.error('Erreur:', state.error);
  //     }
  //   });
  // }

  updateStatus(request: RequestDocument, newStatus: RequestStatus) {
    this.onUpdateStatus.emit({ request, newStatus });
    this.openMenuId = null; // fermer le menu après action
  }

    // 👁 Voir documents
  openDocuments(request: any, event: Event) {
    event.stopPropagation();
    if (request.documentUrl) {
      window.open(request.documentUrl, '_blank');
    } else {
      alert('Aucun document disponible');
    }
  }

    // 📥 Télécharger document
  downloadDocument(request: any, event: Event) {
    event.stopPropagation();
    this.http.get(`${environment.API_URL}/requests/${request.publicId}/document`, { responseType: 'blob' })
      .subscribe(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `document-${request.publicId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      });
  }

  // 📄 Générer certificat
  generateCertificate(request: any, event: Event) {
    event.stopPropagation();
    this.http.get(`/api/requests/${request.publicId}/certificate`, { responseType: 'blob' })
      .subscribe(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificat-${request.publicId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      });
  }

  // ⬆️ Upload documents
// ⬆️ Upload documents
uploadDocuments(request: any, event: Event) {
  event.stopPropagation();

  // Vérifier si le document est approuvé
  if (request.status?.value !== 'APPROVED') {
    alert('Le document doit être approuvé pour pouvoir uploader un fichier.');
    return;
  }

  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/pdf,image/*';

  input.onchange = () => {
    if (!input.files || input.files.length === 0) return;

    const formData = new FormData();
    formData.append('file', input.files[0]);

    this.http.post(`${environment.API_URL}/requests/${request.publicId}/upload`, formData)
      .subscribe({
        next: (res: any) => {
          alert('Document uploadé avec succès ✅');

          // Mettre à jour la propriété documentUrl pour afficher le lien
          if (res.documentUrl) {
            request.documentUrl = res.documentUrl;
          }
        },
        error: (err) => {
          console.error(err);
          alert('Erreur lors de l’upload ❌');
        }
      });
  };

  input.click();
}

}
