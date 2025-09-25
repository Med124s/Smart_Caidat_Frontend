import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { paginationComponent } from 'src/app/core/commons/pagination/pagination.component';
import { CorrespondanceService } from 'src/app/core/services/correspondance.service';
import { CorrespondanceResponse } from 'src/app/core/services/models/response/CorrespondanceResponse';
import { PageResponse } from 'src/app/core/services/models/response/PageResponse';
import { TypeResponse } from 'src/app/core/services/models/response/TypeResponse';
import {CorrespondanceRequest } from 'src/app/core/services/models/request/CorrespondanceRequest';
import { TypeService } from 'src/app/core/services/type.service';
import { ToastService } from 'src/app/shared/toast/toast.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-correspondance',
  standalone: true,
  imports: [CommonModule , ReactiveFormsModule, AngularSvgIconModule, paginationComponent, FormsModule],
  templateUrl: './correspondance.component.html',
  styleUrl: './correspondance.component.css'
})
export class CorrespondanceComponent implements OnInit {

  
visible: boolean = false;
visibleUpdate: boolean = false;
visibleView: boolean = false;


correspondanceForm!: FormGroup;
selectedFile: File | null = null;
fileError: boolean = false;

_correspondanceResponse: PageResponse<CorrespondanceResponse> = {};
_currentCorrespondance: CorrespondanceResponse | null = null;
_types: TypeResponse[] = [];
_page: number = 0;
_size: number = 5;
_keyword: string = "";

_selectedIds: number[] = [];
selectAll: boolean = false;

constructor(private fb: FormBuilder,
  private correspondanceService: CorrespondanceService,
  private typeService: TypeService,
  private toastService: ToastService) {}

ngOnInit() {
  this.onSearch();
  this.allTypes();
  this.correspondanceForm = this.fb.group({
    subject: ['', Validators.required],
    description: ['', Validators.required],
    typeId: ['', Validators.required],
    sender: ['', Validators.required],
    reference: ['', Validators.required],
    recipient: ['', Validators.required],
    dateReception: ['', Validators.required]
  });
}

onSearch(){
  this.correspondanceService.search(this._page, this._size, this._keyword).subscribe({
    next: (response) => {
      console.log(response.body);
        if (response.body) {
          this._correspondanceResponse = response.body;
        } else {
          this.toastService.show('Aucune correspondances trouvés', 'WARNING');
        }
    },
    error: (err) => {
      console.error(err);
      this.toastService.show('Error lors de la récupération de correspondances.', 'DANGER');
    }
  })
}

onSearchCorrespondance(){
    this._page = 0;
    this.onSearch();
}



onSelectRow(event: Event, id: number) {
  const checked = (event.target as HTMLInputElement).checked;

  if (checked) {
    if (!this._selectedIds.includes(id)) {
      this._selectedIds.push(id);
    }
  } else {
    this._selectedIds = this._selectedIds.filter(selectedId => selectedId !== id);
    this.selectAll = false; 
  }
    if (
      this._selectedIds.length === (this._correspondanceResponse?.content?.length ?? 0)
    ) {
      this.selectAll = true;
    }

}



onToggleSelectAll(event: Event) {
  const checked = (event.target as HTMLInputElement).checked;
  this.selectAll = checked;

  if (checked) {
    this._selectedIds = this._correspondanceResponse?.content?.map(c => c.id) ?? [];
  } else {
    this._selectedIds = [];
  }
}



allTypes(){
  this.typeService.getAll().subscribe({
    next: (response) => {
        if (response) {
          this._types = response;
        } else {
          this.toastService.show('Aucune type de correspondance trouvés', 'WARNING');
        }
    },
    error: (err) => {
      console.error(err);
      this.toastService.show('Error lors de la récupération de types.', 'DANGER');
    }
  })
}


onSubmit(): void {
  if (this.correspondanceForm.invalid) {
    this.toastService.show('Veuillez remplir tous les champs requis.', 'DANGER');
    return;
  }


    const request: CorrespondanceRequest = {
      subject: this.correspondanceForm.get('subject')?.value,
      description: this.correspondanceForm.get('description')?.value,
      sender: this.correspondanceForm.get('sender')?.value,
      reference: this.correspondanceForm.get('reference')?.value,
      recipient: this.correspondanceForm.get('recipient')?.value,
      dateReception: this.correspondanceForm.get('dateReception')?.value,
      typeId: this.correspondanceForm.get('typeId')?.value,
      lastModifiedBy: 1,
    }

  if(this._currentCorrespondance?.id){
    this.correspondanceService.update(this._currentCorrespondance.id, request).subscribe({
      next: (response) => {
        console.log(response);
          this.toastService.show('Correspondance modifiée avec success', 'SUCCESS');
          this.correspondanceForm.reset();
          this.onSearch();
          this._currentCorrespondance = null;
      },
      error: (err) => {
        console.error(err);
        this.toastService.show("Error lors de la modification d'une correspondance.", 'DANGER');
      }
    });
  } else {
    request.createdBy = 2;
    this.correspondanceService.save(request).subscribe({
      next: (response) => {
        console.log(response);
          this.toastService.show('Nouvelle correspondance ajoutée avec success', 'SUCCESS');
          this.correspondanceForm.reset();
          this.onSearch();
      },
      error: (err) => {
        console.error(err);
        this.toastService.show("Error lors de l'ajout d'une nouvelle correspondance.", 'DANGER');
      }
    });
  }


  this.visible = false;
  this.visibleUpdate = false;
}

openModal() {
  this.visible = true;
  this.visibleUpdate = false;
}

openModalView(correspondance: CorrespondanceResponse) {
  console.log(correspondance)
  if(correspondance != null) {
    this._currentCorrespondance = correspondance;
    this.visibleView = true;
  }
}

openModalUpdate(correspondance: CorrespondanceResponse) {
  this.visible = false;
  this.visibleUpdate = true;
  this._currentCorrespondance = correspondance;
    this.correspondanceForm = this.fb.group({
    subject: [correspondance.subject, Validators.required],
    description: [correspondance.description, Validators.required],
    typeId: [correspondance.typeCorrespondance.id, Validators.required],
    sender: [correspondance.sender, Validators.required],
    reference: [correspondance.reference, Validators.required],
    recipient: [correspondance.recipient, Validators.required],
    dateReception: [correspondance.dateReception, Validators.required]
  });
}


cancel() {
  this.visible = false;
  this.visibleUpdate = false;
  this.visibleView = false;
  this._currentCorrespondance = null;
  this.correspondanceForm.reset(); 
}


deleteSelectedCorrespondances() {
      if(this._selectedIds.length === 0) {  
            Swal.fire({
              icon: 'warning',
              title: 'Aucune correspondance sélectionnée',
              text: 'Veuillez sélectionner au moins une correspondance.',
              confirmButtonText: 'OK',
              confirmButtonColor: '#3085d6',
            });
            return;
      } else {
            Swal.fire({
                title: `Voulez-vous supprimer ${this._selectedIds.length} correspondance(s) ?`,
                text: 'Cette action est irréversible.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#dc2626', // rouge (danger)
                cancelButtonColor: '#6b7280', // gris (neutre)
                confirmButtonText: 'Oui, supprimer',
                cancelButtonText: 'Annuler',
              }).then((result) => {
                if (result.isConfirmed) {
                  this.correspondanceService.deleteMany(this._selectedIds).subscribe({
                        next: (response) => {
                            console.log(response)
                            this.toastService.show(`${this._selectedIds.length} Correspondance(s) supprimé(s) avec succès !`, 'SUCCESS');
                            this.onSearch();
                            this._selectedIds = [];
                        },
                        error: (err) => {
                          console.error(err);
                          this.toastService.show('Error lors de la suppression', 'DANGER');
                        }
                  })
                }
              }); 
            }}


  onSizeChange(newSize: number): void {
    this._size = newSize;
    this.onSearch();
  }

  onPageChange(page: number): void {
    this._page = page;
    this.onSearch();
  }

}
