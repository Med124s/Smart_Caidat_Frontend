import { ArchiveService } from './../table/services/archive-docs.service';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, signal, SimpleChanges } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { Archive, ArchiveType, ArchiveStatut, LieuStockage, Confidentiality } from '../../model/archive.model';
import { CitizenSearchService } from 'src/app/modules/citoyen/pages/table/services/citizen-search.service';
import { UserSearchService } from 'src/app/modules/uikit/pages/table/services/user-search.service';
// import { RequestDocument } from '../../../request_document/model/request.model';
import { RegisterUser } from 'src/app/shared/models/user.model';
import { Citizen } from 'src/app/modules/citoyen/model/citoyen.model';
import dayjs from 'dayjs';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { RequestSearchService } from '../../../request/pages/table/services/request-docs.service';
import { RequestDocument } from '../../../request/model/request.model';
// import { SearchQuery } from '../../model/archive-search.model';
// import { RequestSearchService } from '../../../request_document/pages/table/services/request.service';

@Component({
  selector: 'app-archive-document',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor, AsyncPipe],
  templateUrl: './archive-documents.component.html',
  styleUrls: ['./archive-documents.component.css'],
})
export class ArchiveDocumentComponent implements OnInit, OnChanges {
  @Input() archive: Archive | null = null;
  @Input() visible = false;
  @Input() mode: 'create' | 'edit' = 'create';

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Archive>();

  archiveForm!: FormGroup;
  ownerType: 'CITIZEN' | 'USER' | 'NONE' = 'NONE';
  selectedCitoyenId = '';
  selectedUser = '';
  demandesValidees$!: Observable<RequestDocument[]>;
  users$: Observable<RegisterUser[]> = of([]);
  citizens$: Observable<Citizen[]> = of([]);
  demandes = signal<RequestDocument[]>([]);

  archiveTypes = Object.values(ArchiveType);
  archiveStatuts = Object.values(ArchiveStatut);
  confidentialites = Object.values(Confidentiality);
  lieuxStockage = Object.values(LieuStockage);

  categories = [
    { id: 1, publicId: '3d47d76b-96ee-4d22-983d-aaedb16e1c6c', categoryName: 'Administration' },
    { id: 2, publicId: 'aceffc2b-c481-4c90-a14c-38b5620dc562', categoryName: 'Correspondance' },
    { id: 3, publicId: '3f57f4e3-758b-4a81-b9b3-dd7af13960ff', categoryName: 'collectivité territoriale' },
    { id: 4, publicId: '7b85090e-2767-4800-993f-39cc228b65d0', categoryName: 'préfecture' },
  ];

  allStatuses = [
    { value: 'ON_HOLD', label: 'En attente' },
    // { value: 'DELETED', label: 'Supprimé' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'ARCHIVED', label: 'Archivé' },
  ];
  currentUserRole = 'ADMIN';

  private isSaving = false;

  get canChangeStatus() {
    return this.allowedStatuses.length > 0;
  }
  get allowedStatuses() {
    if (this.currentUserRole === 'ADMIN') return this.allStatuses;
    if (this.currentUserRole === 'SECRETAIRE') return this.allStatuses.filter((s) => s.value === 'ARCHIVE');
    return [];
  }

  onCitoyenSelected(citoyenId: string) {
    this.selectedCitoyenId = citoyenId;
    if (!citoyenId) return;

    const query: any = { page: { page: 0, size: 10, sort: ['dateCreation,DESC'] }, query: '' };
    this.requestService.triggerFetchRequestsByCitizen(citoyenId, query);

    this.demandesValidees$ = this.requestService.searchResultByCitizen.pipe(
      map((state) => state.value?.data.filter((d: any) => d.status?.value === 'APPROVED') ?? []),
    );
  }

  constructor(
    private fb: FormBuilder,
    private citizenService: CitizenSearchService,
    private requestService: RequestSearchService,
    private userService: UserSearchService,
    private archiveService: ArchiveService,
    private toastService: ToastService,
  ) {
    this.archiveForm = this.fb.group({
      title: ['', Validators.required],
      description: ['',  Validators.required],
      categoryPublicId: ['', Validators.required],
      citizenPublicId: [''],
      status: ['ARCHIVE', Validators.required],
      confidentiality: ['PUBLIC', Validators.required],
      storageLocation: ['LOCAL', Validators.required],
      ownerPublicId: [''],
      ownerType: ['NONE'],
      creationDate: [dayjs(new Date()).format('YYYY-MM-DDTHH:mm:ss')],
      documents: this.fb.array([], this.minOneDocument),
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['archive'] && this.archive) {
      // Patch formulaire avec les valeurs de l'archive
      this.archiveForm.patchValue({
        title: this.archive.title,
        description: this.archive.description,
        categoryPublicId: this.archive.categoryPublicId,
        citizenPublicId: this.archive.citizenPublicId,
        // categoryName: this.archive.categoryName,
        status: this.archive.status,
        confidentiality: this.archive.confidentiality,
        storageLocation: this.archive.storageLocation,
        ownerPublicId: this.archive.ownerPublicId,
        ownerType: this.archive.ownerType,
        creationDate: this.archive.creationDate,
      });

      // Patch documents si présents
      if (this.archive.documents?.length) {
        this.patchDocuments(this.archive.documents);
      } else {
        this.documents.clear(); // sinon vide le FormArray
      }

      // Définir ownerType pour radio buttons
      this.ownerType = this.archive.ownerType || 'NONE';
    }
  }

  ngOnInit(): void {
    if (this.archive) {
      this.archiveForm.patchValue(this.archive);
      if (this.archive.documents?.length) this.patchDocuments(this.archive.documents);
    }
  }

  get documents(): FormArray {
    return this.archiveForm.get('documents') as FormArray;
  }

  minOneDocument(control: AbstractControl) {
    const arr = control as FormArray;
    return arr && arr.length > 0 ? null : { required: true };
  }

  addDocument(): void {
    this.documents.push(
      this.fb.group({
        fileTitle: ['', Validators.required],
        fileName: ['', Validators.required],
        mimeType: [''],
        size: [0],
        uploadDate: ['', Validators.required],
      }),
    );
  }

  removeDocument(index: number) {
    const docGroup = this.documents.at(index);
    const docId = docGroup.get('id')?.value;
    if (docId) {
      this.archiveService.deleteDocument(docId).subscribe({
        next: () => {
          this.documents.removeAt(index);
          this.toastService.show('📄 Document supprimé avec succès', 'SUCCESS');
        },
        error: () => this.toastService.show('❌ Erreur suppression', 'DANGER'),
      });
    } else {
      this.documents.removeAt(index);
    }
  }

  // private patchDocuments(docs: any[]): void {
  //   this.documents.clear();
  //   docs.forEach((doc) => {
  //     const docForm = this.fb.group({
  //       id: [doc.id || null],
  //       fileTitle: [doc.fileTitle || '', Validators.required],
  //       fileName: [doc.fileName || '', Validators.required],
  //       mimeType: [doc.mimeType || ''],
  //       size: [doc.size || 0],
  //       uploadDate: [doc.uploadDate || dayjs(new Date()).format('YYYY-MM-DDTHH:mm:ss')],
  //     });

  //     (docForm as any)._file = doc._file || null;
  //     this.documents.push(docForm);
  //   });
  // }

  patchDocuments(docs: any[]) {
    const formArray = this.fb.array(
      docs.map((doc) =>
        this.fb.group({
          id: [doc.id],
          publicId: [doc.publicId],
          fileName: [doc.fileName],
          fileTitle: [doc.fileTitle],
          mimeType: [doc.mimeType],
          // pas de "file", on garde juste l'existant
        }),
      ),
    );

    this.archiveForm.setControl('documents', formArray);

    // ⚡ très important : mettre un marqueur pour dire que ce document n’a pas de fichier modifié
    formArray.controls.forEach((ctrl: any) => {
      ctrl._file = null;
    });
  }

  onFileSelected(event: any, index: number) {
    const file: File = event.target.files[0];
    if (!file) return;

    const docGroup = this.documents.at(index);
    docGroup.patchValue({
      fileName: file.name,
      mimeType: file.type,
      size: file.size,
      uploadDate: dayjs(new Date()).format('YYYY-MM-DDTHH:mm:ss'),
    });
    // (docGroup as any)._file = file;
    // ⚡ on garde le vrai fichier en mémoire pour l’upload
    (docGroup as any)._file = file;
  }

  onOwnerTypeChange(type: 'CITIZEN' | 'USER' | 'NONE') {
    this.ownerType = type;
    this.archiveForm.patchValue({ ownerType: type, ownerPublicId: '' });
    this.selectedCitoyenId = '';
    this.selectedUser = '';
    this.demandes.set([]);
    if (type === 'USER') this.loadUsers();
    if (type === 'CITIZEN') this.loadCitizens();
  }

  loadUsers() {
    const query = { page: { page: 0, size: 10, sort: ['firstName,DESC'] }, query: '' };
    this.users$ = this.userService.searchResult.pipe(map((state) => state.value?.users ?? []));
    this.userService.search(query);
  }

  loadCitizens() {
    const query = { page: { page: 0, size: 10, sort: ['firstName,DESC'] }, query: '' };
    this.citizens$ = this.citizenService.searchResult.pipe(map((state) => state.value?.data ?? []));
    this.citizenService.searchCitizen(query);
  }

  cancel() {
    this.archiveForm.reset();
    this.close.emit();
  }

  onSubmit() {
    if (this.isSaving) return;
    if (this.archiveForm.invalid) {
      this.archiveForm.markAllAsTouched();
      return;
    }
    if (!this.documents.length) {
      this.toastService.show('❌ Vous devez ajouter au moins un document', 'DANGER');
      return;
    }

    this.isSaving = true;

    // const categoryPublicId = this.archiveForm.get('categoryPublicId')?.value;
    // const c = this.categories.find((cat) => cat.publicId == categoryPublicId)?.categoryName;

    // Construire l'objet Archive à partir du formulaire
    const archive: Archive = {
      ...this.archive,
      ...this.archiveForm.value,
      documents: this.documents.controls.map((ctrl: any) => {
        const docValue = ctrl.value;

        // si l’utilisateur a choisi un nouveau fichier (_file existe)
        const newFile: File | null = (ctrl as any)._file || null;
        return {
          id: docValue.id || null,
          publicId: docValue.publicId || null,
          fileName: docValue.fileName,
          fileTitle: docValue.fileTitle,
          mimeType: docValue.mimeType,
          file: newFile, // seulement si modifié
        };
      }),
    };

    // fichiers à uploader séparément
    // const filesToUpload: File[] = this.documents.controls
    //   .map((ctrl: any) => (ctrl as any)._file || null)
    //   .filter((f: File | null): f is File => !!f);

    const filesToUpload: File[] = archive
      .documents!.filter((d: any) => !d.publicId && d.file) // uniquement nouveaux
      .map((d: any) => d.file);

    console.log('. . . . . UPLOAD FILE');
    console.log(filesToUpload);

    // Extraire uniquement les fichiers nouveaux à uploader
    // const filesToUpload: File[] = archive.documents!.map((d: any) => d.file).filter((f): f is File => !!f);

    const save$ =
      this.mode === 'create'
        ? this.archiveService.createArchive(archive, filesToUpload)
        : this.archiveService.updateArchive(this.archive!.publicId!, archive, filesToUpload);

    save$.subscribe({
      next: (res) => {
        this.isSaving = false;
        if (res.status === 'OK' && res.value) {
          this.toastService.show(this.mode === 'create' ? 'Archive créée ✅' : 'Archive mise à jour ✅', 'SUCCESS');
          this.save.emit(res.value);
          this.close.emit();
        } else {
          this.toastService.show(this.mode === 'create' ? 'Erreur création ❌' : 'Erreur mise à jour ❌', 'DANGER');
        }
      },
      error: () => {
        this.isSaving = false;
        this.toastService.show(this.mode === 'create' ? 'Erreur création ❌' : 'Erreur mise à jour ❌', 'DANGER');
      },
    });
  }
}
