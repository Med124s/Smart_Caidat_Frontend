import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ToastService } from 'src/app/shared/toast/toast.service';
import Swal from 'sweetalert2';
import { CardMeetingComponent } from './card-meeting/card-meeting.component';
import { paginationComponent } from 'src/app/core/commons/pagination/pagination.component';
import { MeetingRequest } from 'src/app/core/services/models/request/MeetingRequest';
import { MeetingService } from 'src/app/core/services/meeting.service';
import { SalleResponse } from 'src/app/core/services/models/response/SalleResponse';
import { SalleService } from 'src/app/core/services/salle.service';
import { MeetingResponse } from 'src/app/core/services/models/response/MeetingResponse';
import { PageResponse } from 'src/app/core/services/models/response/PageResponse';
import { ParticipantRequest } from 'src/app/core/services/models/request/ParticipantRequest';

@Component({
  selector: 'app-meeting',
  standalone: true,
  imports: [CommonModule , FormsModule, ReactiveFormsModule, AngularSvgIconModule, CardMeetingComponent, paginationComponent],
  templateUrl: './meeting.component.html',
  styleUrl: './meeting.component.css'
})
export class MeetingComponent implements OnInit {

  
visible: boolean = false;
visibleUpdate: boolean = false;

meetingForm!: FormGroup;
_meetingResponse: PageResponse<MeetingResponse> = {};
_salles: SalleResponse[] = [];
_page: number = 0;
_size: number = 5;
_keyword: string = "";
_selectedMeeting: MeetingResponse | null = null;
_keywordDateMeeting: string = "";

_participants: ParticipantRequest[] = [];
participant: ParticipantRequest = {
  firstName: '',
  lastName: '',
  email: '',
  organisme: ''
}
_organisms: string[] = ['Organisme 1','Organisme 2','Organisme 3','Organisme 4'];

constructor(private fb: FormBuilder,
  private meetingService: MeetingService,
  private salleService: SalleService,
  private toastService: ToastService) {}

ngOnInit() {
  this.meetingForm = this.fb.group({
    subject: ['', Validators.required],
    description: ['', Validators.required],
    salleId: ['', Validators.required],
    dateMeeting: ['', Validators.required],
    timeMeeting: ['', Validators.required]
  });
  this.allSalles();
  this.onSearch();
}

toUpdateMeeting(meeting: MeetingResponse) {
  this._participants = meeting.participants;
  this.openModalUpdate(meeting);
}

onSearchMeeting(){
    this._page = 0;
    this.onSearch();
}

onSearch(){
  this.meetingService.search(this._page, this._size, this._keyword, this._keywordDateMeeting).subscribe({
    next: (response) => {
      console.log(response.body);
        if (response.body) {
          this._meetingResponse = response.body;
        } else {
          this.toastService.show('Aucune réunion trouvée', 'WARNING');
        }
    },
    error: (err) => {
      console.error(err);
      this.toastService.show('Error lors de la récupération de réunions.', 'DANGER');
    }
  })
}

onSearchByDate(){
    console.log(this._keywordDateMeeting)
    this._page = 0;
    this.onSearch();
}

allSalles(){
  this.salleService.getAll().subscribe({
    next: (response) => {
        if (response) {
          this._salles = response;
        } else {
          this.toastService.show('Aucune salle de réunion trouvés', 'WARNING');
        }
    },
    error: (err) => {
      console.error(err);
      this.toastService.show('Error lors de la récupération de types.', 'DANGER');
    }
  })
}

addParticipant(){
  if(this.participant.email != '' || this.participant.firstName != '' || this.participant.lastName != '' || this.participant.organisme != ''){
      this._participants.push(this.participant);
      this.participant = {
      firstName: '',
      lastName: '',
      email: '',
      organisme: ''
      }
  } else {
    this.toastService.show('Veuillez remplir tous les champs requis.', 'DANGER');
  }

}

deleteParticipant(participant: ParticipantRequest): void {
  this._participants = this._participants.filter(p => p !== participant);
}

onSubmit(): void {
  if (this.meetingForm.invalid || this._participants.length == 0) {
    this.toastService.show('Veuillez remplir tous les champs requis.', 'DANGER');
    return;
  }
    const request: MeetingRequest = {
      subject: this.meetingForm.get('subject')?.value,
      description: this.meetingForm.get('description')?.value,
      salleId: this.meetingForm.get('salleId')?.value,
      dateMeeting: this.meetingForm.get('dateMeeting')?.value,
      timeMeeting: this.meetingForm.get('timeMeeting')?.value,
      lastModifiedBy: 1,
      createdBy: 1,
      participants: this._participants
    }
    
    if(this._selectedMeeting?.id){
        this.meetingService.update(this._selectedMeeting?.id, request).subscribe({
          next: (response) => {
              console.log(response);
              this.toastService.show('Réunion modifiée avec success', 'SUCCESS');
              this.meetingForm.reset();
              this.onSearch();
          },
          error: (err) => {
            console.error(err);
            this.toastService.show("Error lors de la modification de la réunion.", 'DANGER');
          }
        });
    } else {
        this.meetingService.save(request).subscribe({
          next: (response) => {
              console.log(response);
              this.toastService.show('Nouvelle réunion ajoutée avec success', 'SUCCESS');
              this.meetingForm.reset();
              this.onSearch();
          },
          error: (err) => {
            console.error(err);
            this.toastService.show("Error lors de l'ajout d'une nouvelle réunion.", 'DANGER');
          }
        });
    }

  this.visible = false;
  this.visibleUpdate = false;
  this._selectedMeeting = null;
  this._participants = [];
}

openModal() {
  this.visible = true;
  this.visibleUpdate = false;
}

openModalUpdate(meeting: MeetingResponse) {
  this._selectedMeeting = meeting;
  const fullDate = new Date(this._selectedMeeting.dateMeeting);
  const dateOnly = this._selectedMeeting.dateMeeting.split('T')[0];
  const timeMeeting = fullDate.toLocaleTimeString('fr-FR', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
  });

  this.visible = false;
  this.visibleUpdate = true;
    this.meetingForm = this.fb.group({
    subject: [meeting.subject, Validators.required],
    description: [meeting.description, Validators.required],
    salleId: [meeting.salle.id, Validators.required],
    dateMeeting: [dateOnly, Validators.required],
    timeMeeting: [timeMeeting, Validators.required]
  });
}


cancel() {
  this.visible = false;
  this.visibleUpdate = false;
  this.meetingForm.reset(); 
}


onSizeChange(newSize: number): void {
    this._size = newSize;
    this.onSearch();
}

onPageChange(page: number): void {
    this._page = page;
    this.onSearch();
}

}
