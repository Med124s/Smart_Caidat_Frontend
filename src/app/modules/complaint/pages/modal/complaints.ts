import {
  ComplaintPriority,
  ComplaintPriorityLabel,
  ComplaintType,
  ComplaintTypeLabel,
} from './../../../../../../.history/src/app/modules/complaint/model/complaint.model_20250907154702';
import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AsyncPipe, DatePipe, NgFor, NgIf } from '@angular/common';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Oauth2AuthService } from 'src/app/modules/auth/oauth2-auth.service';
import { State } from 'src/app/shared/models/state.model';
import { ConnectedUser } from 'src/app/shared/models/user.model';
import { map, Observable, of } from 'rxjs';
import { Citizen } from 'src/app/modules/citoyen/model/citoyen.model';
import { CitizenSearchService } from 'src/app/modules/citoyen/pages/table/services/citizen-search.service';
import { HttpClient } from '@angular/common/http';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { ComplaintService } from '../table/services/complaint.service';
import { Complaint, ComplaintStatus, ComplaintStatusLabel } from '../../model/complaint.model';
import { PrettyComplaintTypePipe } from 'src/app/shared/pipes/PrettyComplaintTypePipe';
import { PrettyComplaintStatusPipe } from 'src/app/shared/pipes/PrettyComplaintStatusPipe';
import { PrettyComplaintPriorityPipe } from 'src/app/shared/pipes/PrettyComplaintPriorityPipe';

@Component({
  selector: 'app-complaints-request',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor, AsyncPipe,DatePipe, PrettyComplaintTypePipe,
     PrettyComplaintStatusPipe, PrettyComplaintPriorityPipe],
  templateUrl: './complaints.component.html',
  styleUrls: ['./complaints.component.css'],
})
export class ComplaintsRequestComponent implements OnInit, OnChanges {
  @Input() complaint: Complaint | any | null = null;
  // @Input() visible = false;
  @Input() mode: 'create' | 'edit' | 'about' = 'create';

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Complaint>();

  // Exposer enum + labels
  ComplaintStatus = ComplaintStatus;
  ComplaintStatusLabel = ComplaintStatusLabel;
  ComplaintPriority = ComplaintPriority;
  ComplaintPriorityLabel = ComplaintPriorityLabel;
  ComplaintType = ComplaintType;
  ComplaintTypeLabel = ComplaintTypeLabel;

  selectedCitoyenId = '';
  citizens$: Observable<Citizen[]> = of([]);
  citizenService = inject(CitizenSearchService);
  fb = inject(FormBuilder);
  oauth2Auth = inject(Oauth2AuthService);
  complaintForm!: FormGroup;
  complaintService = inject(ComplaintService);
  canChangeStatus = false;
  http = inject(HttpClient);
  toastService = inject(ToastService);

  constructor() {
    this.complaintForm = this.fb.group({
      title: ['', Validators.required],
      type: ['', Validators.required],
      otherType: [''],
      description: [''],
      priority: ['', Validators.required],
      citizenPublicId: ['', Validators.required],
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    // this.complaintForm.reset();
    if (changes['complaint'] && this.complaint) {
      // Patch formulaire avec les valeurs de l'archive
      let dateValue: string = '';

      if (this.complaint.creationDate) {
        if (this.complaint.creationDate instanceof Date) {
          // إذا جا Date
          dateValue = this.complaint.creationDate.toISOString().split('T')[0];
        } else {
          // إذا جا string
          dateValue = this.complaint.creationDate.split('T')[0];
        }
      }
      console.log('______ ____________ ______________________');

      console.log(this.complaint.citizen);

      this.complaintForm.patchValue({
        type: this.complaint.type,
        description: this.complaint.description,
        // otherType: this.complaint.otherType,
        reason: this.complaint.reason,
        citizenPublicId: this.complaint.citizen?.publicId,
        title: this.complaint.title,
        priority: this.complaint.priority,
        status: this.complaint.status,
        creationDate: dateValue,
      });
    }
  }

  currentUser: ConnectedUser | null = null;
  ngOnInit() {
    // if (this.complaint) {
    //   this.complaintForm.patchValue(this.complaint);
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

  onSubmit() {
    if (this.complaintForm.invalid) return;

    const formValue = this.complaintForm.value;

    //     // gérer le type "AUTRE"
    if (formValue.type === ComplaintType.OTHER && formValue.otherType) {
      formValue.description = `[Autre type: ${formValue.otherType}] ${formValue.description || ''}`;
    }

    const compalintVal = {...formValue, publicId:this.complaint?.publicId}
    
    console.log("___________ ___________ __________ UPDATE");
    console.log(compalintVal);
    
    
    let obs$;
    if (this.mode === 'create') {
      obs$ = this.complaintService.create(formValue);
      } 
      else {
        obs$ = this.complaintService.update(compalintVal);
      }

      obs$.subscribe({
        next: (state) => {
          if (state.status === 'OK' && state.value) {
            this.toastService.show(
              this.mode === 'create' ? 'Réclamation créée ✅' : 'Réclamation mise à jour ✅',
              'SUCCESS',
            );
            this.save.emit(state.value);
            this.cancel();
          } else if (state.status === 'ERROR') {
            this.toastService.show(this.mode === 'create' ? 'Erreur création ❌' : 'Erreur mise à jour ❌', 'DANGER');
          }
        },
        error: () =>
          this.toastService.show(this.mode === 'create' ? 'Erreur création ❌' : 'Erreur mise à jour ❌', 'DANGER'),
      });
    }

  cancel() {
    this.complaintForm.reset();
    this.close.emit();
  }
}
