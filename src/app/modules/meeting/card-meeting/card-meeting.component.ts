import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { MeetingService } from 'src/app/core/services/meeting.service';
import { MeetingResponse } from 'src/app/core/services/models/response/MeetingResponse';
import { ToastService } from 'src/app/shared/toast/toast.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-card-meeting',
  standalone: true,
  imports: [CommonModule , ReactiveFormsModule, AngularSvgIconModule, FormsModule],
  templateUrl: './card-meeting.component.html',
  styleUrl: './card-meeting.component.css'
})
export class CardMeetingComponent implements OnInit {
  @Input() currentMeeting: MeetingResponse | null = null;
  @Output() action = new EventEmitter<MeetingResponse>();
  visibleView: boolean = false;

constructor(private toastService: ToastService, private meetingService: MeetingService) {}

ngOnInit() {
}

openModalView() {
  this.visibleView = true;
}
cancel() {
  this.visibleView = false;
}

deleteSelectedMeetings() {
  Swal.fire({
      title: `Voulez-vous supprimer la réuninon ${this.currentMeeting?.subject} ?`,
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626', 
      cancelButtonColor: '#6b7280', 
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
    }).then((result) => {
      if (result.isConfirmed) {
        if(this.currentMeeting?.id){
            this.meetingService.delete(this.currentMeeting?.id).subscribe({
              next: (response) => {
                this.toastService.show('Meetings supprimés avec succès !', 'SUCCESS');
              },
              error: (err) => {
                console.log(err)
                this.toastService.show('Erreur lors de la suppression de la réunion', 'DANGER');
              }
            })
        }
        
      }
    }); 
  }

  toUpdate() {
    this.action.emit(this.currentMeeting!);
  }

}
