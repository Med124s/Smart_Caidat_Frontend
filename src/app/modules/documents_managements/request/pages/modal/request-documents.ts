import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { RequestDocument, RequestStatus, RequestType } from '../../model/request.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Oauth2AuthService } from 'src/app/modules/auth/oauth2-auth.service';
import { State } from 'src/app/shared/models/state.model';
import { ConnectedUser } from 'src/app/shared/models/user.model';
import { map, Observable, of } from 'rxjs';
import { Citizen } from 'src/app/modules/citoyen/model/citoyen.model';
import { CitizenSearchService } from 'src/app/modules/citoyen/pages/table/services/citizen-search.service';
import { RequestService } from '../table/services/request-docs.service';
import { HttpClient } from '@angular/common/http';
import { toastState } from 'ngx-sonner';
import { ToastService } from 'src/app/shared/toast/toast.service';

@Component({
  selector: 'app-request-document',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor, AsyncPipe],
  templateUrl: './request-documents.component.html',
  styleUrls: ['./request-documents.component.css'],
})
export class RequestDocumentComponent implements OnInit, OnChanges {
  @Input() request: RequestDocument | null = null;
  @Input() visible = false;
  @Input() mode: 'create' | 'edit' = 'create';

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<RequestDocument>();

  RequestType = RequestType;
  RequestStatus = RequestStatus;
  selectedCitoyenId = '';
  citizens$: Observable<Citizen[]> = of([]);
  citizenService = inject(CitizenSearchService);
  fb = inject(FormBuilder);
  oauth2Auth = inject(Oauth2AuthService);
  requestForm!: FormGroup;
  requestService = inject(RequestService);
  canChangeStatus = false;
  http = inject(HttpClient);
  selectedFile: File | null = null;
  toastService = inject(ToastService);
  constructor() {
    this.requestForm = this.fb.group({
      type: ['', Validators.required],
      otherType: [''],
      description: [''],
      motif: [''],
      documentUrl: [''],
      citizenPublicId: ['', Validators.required],
      status: [RequestStatus.PENDING], // default
      creationDate: [new Date()],
    });

    // UUID validatorPublicId,
    // Instant validationDate,
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['request'] && this.request) {
      // Patch formulaire avec les valeurs de l'archive
      let dateValue: string = '';

      if (this.request.creationDate) {
        if (this.request.creationDate instanceof Date) {
          // إذا جا Date
          dateValue = this.request.creationDate.toISOString().split('T')[0];
        } else {
          // إذا جا string
          dateValue = this.request.creationDate.split('T')[0];
        }
      }

      this.requestForm.patchValue({
        type: this.request.type,
        description: this.request.description,
        otherType: this.request.otherType,
        motif: this.request.motif,
        citizenPublicId: this.request.citizenPublicId,
        documentUrl: this.request.documentUrl,
        status: this.request.status?.value,
        creationDate: dateValue,
      });
    }
  }
  currentUser: ConnectedUser | null = null;
  ngOnInit() {
    // if (this.request) {
    //   this.requestForm.patchValue(this.request);
    // }
    this.loadCitizens();
    const state: State<ConnectedUser> = this.oauth2Auth.fetchUser();
    if (state.status === 'OK' && state.value) {
      this.currentUser = state.value;
    }
    this.canChangeStatus = this.currentUser?.authorities?.includes('ROLE_ADMIN') ?? false;
  }

  loadCitizens() {
    const query = { page: { page: 0, size: 10, sort: ['firstName,DESC'] }, query: '' };
    this.citizens$ = this.citizenService.searchResult.pipe(map((state) => state.value?.data ?? []));
    this.citizenService.searchCitizen(query);
  }

  // onSubmit() {
  //   if (this.requestForm.invalid) return;

  //   const formValue = this.requestForm.value;

  //   // gérer AUTRE
  //   if (formValue.type === RequestType.AUTRE && formValue.otherType) {
  //     formValue.description = `[Autre type: ${formValue.otherType}] ${formValue.description || ''}`;
  //   }
  //   const request: RequestDocument = {
  //     ...formValue,
  //     publicId: this.request?.publicId, // si edit
  //     creatorPublicId: this.request?.creatorPublicId || this.currentUser?.publicId, // TODO: remplacer par vrai user connecté
  //     creationDate: this.request?.creationDate || new Date(),
  //   };

  //   const obs$ = this.mode === 'create' ? this.requestService.create(request) : this.requestService.update(request);

  //   obs$.subscribe((state) => {
  //     if (state.status === 'OK' && state.value) {
  //       this.save.emit(state.value);
  //       this.close.emit();
  //     } else if (state.status === 'ERROR') {
  //       console.error('Erreur lors de la sauvegarde:', state.error);
  //       // 👉 tu peux afficher un toaster ou message d'erreur ici
  //     }
  //   });
  // }

  // onSubmit() {
  //   if (this.requestForm.invalid) return;

  //   const formValue = this.requestForm.value;

  //   // gérer AUTRE
  //   if (formValue.type === RequestType.AUTRE && formValue.otherType) {
  //     formValue.description = `[Autre type: ${formValue.otherType}] ${formValue.description || ''}`;
  //   }

  //   const request: RequestDocument = {
  //     ...formValue,
  //     publicId: this.request?.publicId, // si edit
  //     creatorPublicId: this.request?.creatorPublicId || this.currentUser?.publicId,
  //     creationDate: this.request?.creationDate || new Date(),
  //     documentUrl: formValue.documentUrl, // url du document uploadé par l'admin
  //     validatorPublicId: this.canChangeStatus ? this.currentUser?.publicId : this.request?.validatorPublicId,
  //   };

  //   let obs$;
  //   if (this.mode === 'create') {
  //     obs$ = this.requestService.create(request);
  //   } else {
  //     // si seulement l'admin change le status, on peut appeler updateStatus
  //     if (this.canChangeStatus && formValue.status !== this.request?.status && this.currentUser) {
  //       obs$ = this.requestService.updateStatus(request.publicId!, formValue.status, this.currentUser.publicId!);
  //     } else {
  //       obs$ = this.requestService.update(request);
  //     }
  //   }

  //   obs$.subscribe((state) => {
  //     if (state.status === 'OK' && state.value) {
  //       this.save.emit(state.value);
  //       this.close.emit();
  //     } else if (state.status === 'ERROR') {
  //       console.error('Erreur lors de la sauvegarde:', state.error);
  //     }
  //   });
  // }

  // onFileSelected(event: Event) {
  //   const input = event.target as HTMLInputElement;
  //   if (!input.files || input.files.length === 0) return;
  //   const file: File = input.files[0];
  //   if (!this.canChangeStatus) {
  //     alert('Seul un administrateur peut uploader un document.');
  //     return;
  //   }
  //   const formData = new FormData();
  //   formData.append('file', file);

  //   this.http
  //     .post<{ documentUrl: string }>(
  //       `${environment.API_URL}/requests/uploadDocument`, // endpoint backend pour upload lors de la création
  //       formData,
  //     )
  //     .subscribe({
  //       next: (res) => {
  //         alert('Document uploadé avec succès ✅');
  //         if (res.documentUrl) {
  //           this.requestForm.patchValue({ documentUrl: res.documentUrl });
  //         }
  //       },
  //       error: (err) => {
  //         console.error(err);
  //         alert('Erreur lors de l’upload ❌');
  //       },
  //     });
  // }

  onSubmit() {
    if (this.requestForm.invalid) return;

    const formValue = this.requestForm.value;
    const file: File | null = this.selectedFile; // file sélectionné via onFileSelected

  //     // gérer le type "AUTRE"
  if (formValue.type === RequestType.AUTRE && formValue.otherType) {
    formValue.description = `[Autre type: ${formValue.otherType}] ${formValue.description || ''}`;
  }

    const request: RequestDocument = {
      ...formValue,
      publicId: this.request?.publicId,
      creatorPublicId: this.request?.creatorPublicId || this.currentUser?.publicId,
      creationDate: this.request?.creationDate || new Date(),
      validatorPublicId: this.canChangeStatus ? this.currentUser?.publicId : this.request?.validatorPublicId,
      documentUrl: this.request?.documentUrl || null,
    };

    const formData = new FormData();
    formData.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }));

    // ✅ Upload uniquement si l'utilisateur est admin
    if (this.canChangeStatus && file) {
      console.log('_____ true');
      formData.append('file', file);
    }

    let obs$;
    if (this.mode === 'create') {
      obs$ = this.requestService.create(formData);
    } else {
      obs$ = this.requestService.update(formData);
      // si seulement l'admin change le status, on peut appeler updateStatus
      // if (this.canChangeStatus && formValue.status !== this.request?.status['value'] && this.currentUser) {
      //   obs$ = this.requestService.updateStatus(request.publicId!, formValue.status, this.currentUser.publicId!);
      // } else {
      //   obs$ = this.requestService.update(request);
      // }
    }

    obs$.subscribe({
      next: (state) => {
        if (state.status === 'OK' && state.value) {
          this.toastService.show(this.mode === 'create' ? 'Demande créée ✅' : 'Demande mise à jour ✅', 'SUCCESS');
          this.save.emit(state.value);
          this.close.emit();
        } else if (state.status === 'ERROR') {
          this.toastService.show(this.mode === 'create' ? 'Erreur création ❌' : 'Erreur mise à jour ❌', 'DANGER');
        }
      },
      error: () =>
        this.toastService.show(this.mode === 'create' ? 'Erreur création ❌' : 'Erreur mise à jour ❌', 'DANGER'),
    });

    // obs$.subscribe((state) => {
    //   if (state.status === 'OK' && state.value) {
    //     this.save.emit(state.value);
    //     this.close.emit();
    //   } else if (state.status === 'ERROR') {
    //     console.error('Erreur lors de la sauvegarde:', state.error);
    //   }
    // });
  }

  // onFileSelected(event: Event) {
  //   const input = event.target as HTMLInputElement;
  //   if (!input.files || input.files.length === 0) return;

  //   const file = input.files[0];

  //   // Vérifier si l'utilisateur est admin
  //   if (!this.canChangeStatus) {
  //     alert('Seul un administrateur peut uploader un document.');
  //     return;
  //   }

  //   // Stocker le fichier dans le FormGroup
  //   this.requestForm.patchValue({ documentFile: file });
  // }
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    this.selectedFile = input.files[0];
    this.requestForm.patchValue({ documentUrl: this.selectedFile });
    this.requestForm.get('documentUrl')?.updateValueAndValidity();
  }

  cancel() {
    this.requestForm.reset();
    this.close.emit();
  }
}

// @Input() Demande: Archive | null = null;
// @Input() visible = false;
// @Input() mode: 'create' | 'edit' = 'create';

// @Output() close = new EventEmitter<void>();
// @Output() save = new EventEmitter<Archive>();

// archiveForm!: FormGroup;
// ownerType: 'CITIZEN' | 'USER' | 'NONE' = 'NONE';
// selectedCitoyenId = '';
// selectedUser = '';
// demandesValidees$!: Observable<RequestDocument[]>;
// users$: Observable<RegisterUser[]> = of([]);
// citizens$: Observable<Citizen[]> = of([]);
// demandes = signal<RequestDocument[]>([]);

// archiveTypes = Object.values(ArchiveType);
// archiveStatuts = Object.values(ArchiveStatut);
// confidentialites = Object.values(Confidentiality);
// lieuxStockage = Object.values(LieuStockage);

// categories = [
//   { id: 1, publicId: '3d47d76b-96ee-4d22-983d-aaedb16e1c6c', categoryName: 'Administration' },
//   { id: 2, publicId: 'aceffc2b-c481-4c90-a14c-38b5620dc562', categoryName: 'Correspondance' },
//   { id: 3, publicId: '3f57f4e3-758b-4a81-b9b3-dd7af13960ff', categoryName: 'collectivité territoriale' },
//   { id: 4, publicId: '7b85090e-2767-4800-993f-39cc228b65d0', categoryName: 'préfecture' },
// ];

// allStatuses = [
//   { value: 'ON_HOLD', label: 'En attente' },
//   // { value: 'DELETED', label: 'Supprimé' },
//   { value: 'ACTIVE', label: 'Active' },
//   { value: 'ARCHIVED', label: 'Archivé' },
// ];
// currentUserRole = 'ADMIN';

// private isSaving = false;

// get canChangeStatus() {
//   return this.allowedStatuses.length > 0;
// }
// get allowedStatuses() {
//   if (this.currentUserRole === 'ADMIN') return this.allStatuses;
//   if (this.currentUserRole === 'SECRETAIRE') return this.allStatuses.filter((s) => s.value === 'ARCHIVE');
//   return [];
// }

// onCitoyenSelected(citoyenId: string) {
//   this.selectedCitoyenId = citoyenId;
//   if (!citoyenId) return;

//   const query: any = { page: { page: 0, size: 10, sort: ['dateCreation,DESC'] }, query: '' };
//   this.requestService.triggerFetchRequestsByCitizen(citoyenId, query);

//   this.demandesValidees$ = this.requestService.searchResultByCitizen.pipe(
//     map((state) => state.value?.data.filter((d: any) => d.status?.value === 'APPROVED') ?? []),
//   );
// }

// constructor(
//   private fb: FormBuilder,
//   private citizenService: CitizenSearchService,
//   private requestService: RequestSearchService,
//   private userService: UserSearchService,
//   private archiveService: ArchiveServicee,
//   private toastService: ToastService,
// ) {
//   this.archiveForm = this.fb.group({
//     title: ['', Validators.required],
//     description: ['',  Validators.required],
//     categoryPublicId: ['', Validators.required],
//     citizenPublicId: [''],
//     status: ['ARCHIVE', Validators.required],
//     confidentiality: ['PUBLIC', Validators.required],
//     storageLocation: ['LOCAL', Validators.required],
//     ownerPublicId: [''],
//     ownerType: ['NONE'],
//     creationDate: [dayjs(new Date()).format('YYYY-MM-DDTHH:mm:ss')],
//     documents: this.fb.array([], this.minOneDocument),
//   });
// }

// ngOnChanges(changes: SimpleChanges) {
//   if (changes['archive'] && this.archive) {
//     // Patch formulaire avec les valeurs de l'archive
//     this.archiveForm.patchValue({
//       title: this.archive.title,
//       description: this.archive.description,
//       categoryPublicId: this.archive.categoryPublicId,
//       citizenPublicId: this.archive.citizenPublicId,
//       // categoryName: this.archive.categoryName,
//       status: this.archive.status,
//       confidentiality: this.archive.confidentiality,
//       storageLocation: this.archive.storageLocation,
//       ownerPublicId: this.archive.ownerPublicId,
//       ownerType: this.archive.ownerType,
//       creationDate: this.archive.creationDate,
//     });

//     // Patch documents si présents
//     if (this.archive.documents?.length) {
//       this.patchDocuments(this.archive.documents);
//     } else {
//       this.documents.clear(); // sinon vide le FormArray
//     }

//     // Définir ownerType pour radio buttons
//     this.ownerType = this.archive.ownerType || 'NONE';
//   }
// }

// ngOnInit(): void {
//   if (this.archive) {
//     this.archiveForm.patchValue(this.archive);
//     if (this.archive.documents?.length) this.patchDocuments(this.archive.documents);
//   }
// }

// get documents(): FormArray {
//   return this.archiveForm.get('documents') as FormArray;
// }

// minOneDocument(control: AbstractControl) {
//   const arr = control as FormArray;
//   return arr && arr.length > 0 ? null : { required: true };
// }

// addDocument(): void {
//   this.documents.push(
//     this.fb.group({
//       fileTitle: ['', Validators.required],
//       fileName: ['', Validators.required],
//       mimeType: [''],
//       size: [0],
//       uploadDate: ['', Validators.required],
//     }),
//   );
// }

// removeDocument(index: number) {
//   const docGroup = this.documents.at(index);
//   const docId = docGroup.get('id')?.value;
//   if (docId) {
//     this.archiveService.deleteDocument(docId).subscribe({
//       next: () => {
//         this.documents.removeAt(index);
//         this.toastService.show('📄 Document supprimé avec succès', 'SUCCESS');
//       },
//       error: () => this.toastService.show('❌ Erreur suppression', 'DANGER'),
//     });
//   } else {
//     this.documents.removeAt(index);
//   }
// }

// patchDocuments(docs: any[]) {
//   const formArray = this.fb.array(
//     docs.map((doc) =>
//       this.fb.group({
//         id: [doc.id],
//         publicId: [doc.publicId],
//         fileName: [doc.fileName],
//         fileTitle: [doc.fileTitle],
//         mimeType: [doc.mimeType],
//         // pas de "file", on garde juste l'existant
//       }),
//     ),
//   );

//   this.archiveForm.setControl('documents', formArray);

//   // ⚡ très important : mettre un marqueur pour dire que ce document n’a pas de fichier modifié
//   formArray.controls.forEach((ctrl: any) => {
//     ctrl._file = null;
//   });
// }

// onFileSelected(event: any, index: number) {
//   const file: File = event.target.files[0];
//   if (!file) return;

//   const docGroup = this.documents.at(index);
//   docGroup.patchValue({
//     fileName: file.name,
//     mimeType: file.type,
//     size: file.size,
//     uploadDate: dayjs(new Date()).format('YYYY-MM-DDTHH:mm:ss'),
//   });
//   // (docGroup as any)._file = file;
//   // ⚡ on garde le vrai fichier en mémoire pour l’upload
//   (docGroup as any)._file = file;
// }

// onOwnerTypeChange(type: 'CITIZEN' | 'USER' | 'NONE') {
//   this.ownerType = type;
//   this.archiveForm.patchValue({ ownerType: type, ownerPublicId: '' });
//   this.selectedCitoyenId = '';
//   this.selectedUser = '';
//   this.demandes.set([]);
//   if (type === 'USER') this.loadUsers();
//   if (type === 'CITIZEN') this.loadCitizens();
// }

// loadUsers() {
//   const query = { page: { page: 0, size: 10, sort: ['firstName,DESC'] }, query: '' };
//   this.users$ = this.userService.searchResult.pipe(map((state) => state.value?.users ?? []));
//   this.userService.search(query);
// }

// loadCitizens() {
//   const query = { page: { page: 0, size: 10, sort: ['firstName,DESC'] }, query: '' };
//   this.citizens$ = this.citizenService.searchResult.pipe(map((state) => state.value?.data ?? []));
//   this.citizenService.searchCitizen(query);
// }

// onSubmit() {
//   if (this.isSaving) return;
//   if (this.archiveForm.invalid) {
//     this.archiveForm.markAllAsTouched();
//     return;
//   }
//   if (!this.documents.length) {
//     this.toastService.show('❌ Vous devez ajouter au moins un document', 'DANGER');
//     return;
//   }

//   this.isSaving = true;

//   // const categoryPublicId = this.archiveForm.get('categoryPublicId')?.value;
//   // const c = this.categories.find((cat) => cat.publicId == categoryPublicId)?.categoryName;

//   // Construire l'objet Archive à partir du formulaire
//   const archive: Archive = {
//     ...this.archive,
//     ...this.archiveForm.value,
//     documents: this.documents.controls.map((ctrl: any) => {
//       const docValue = ctrl.value;

//       // si l’utilisateur a choisi un nouveau fichier (_file existe)
//       const newFile: File | null = (ctrl as any)._file || null;
//       return {
//         id: docValue.id || null,
//         publicId: docValue.publicId || null,
//         fileName: docValue.fileName,
//         fileTitle: docValue.fileTitle,
//         mimeType: docValue.mimeType,
//         file: newFile, // seulement si modifié
//       };
//     }),
//   };

//   // fichiers à uploader séparément
//   // const filesToUpload: File[] = this.documents.controls
//   //   .map((ctrl: any) => (ctrl as any)._file || null)
//   //   .filter((f: File | null): f is File => !!f);

//   const filesToUpload: File[] = archive
//     .documents!.filter((d: any) => !d.publicId && d.file) // uniquement nouveaux
//     .map((d: any) => d.file);

//   console.log('. . . . . UPLOAD FILE');
//   console.log(filesToUpload);

//   // Extraire uniquement les fichiers nouveaux à uploader
//   // const filesToUpload: File[] = archive.documents!.map((d: any) => d.file).filter((f): f is File => !!f);

//   const save$ =
//     this.mode === 'create'
//       ? this.archiveService.createArchive(archive, filesToUpload)
//       : this.archiveService.updateArchive(this.archive!.publicId!, archive, filesToUpload);

//   save$.subscribe({
//     next: (res) => {
//       this.isSaving = false;
//       if (res.status === 'OK' && res.value) {
//         this.toastService.show(this.mode === 'create' ? 'Archive créée ✅' : 'Archive mise à jour ✅', 'SUCCESS');
//         this.save.emit(res.value);
//         this.close.emit();
//       } else {
//         this.toastService.show(this.mode === 'create' ? 'Erreur création ❌' : 'Erreur mise à jour ❌', 'DANGER');
//       }
//     },
//     error: () => {
//       this.isSaving = false;
//       this.toastService.show(this.mode === 'create' ? 'Erreur création ❌' : 'Erreur mise à jour ❌', 'DANGER');
//     },
//   });
// }
