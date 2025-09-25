import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { paginationComponent } from 'src/app/core/commons/pagination/pagination.component';
import { SalleRequest } from 'src/app/core/services/models/request/SalleRequest';
import { PageResponse } from 'src/app/core/services/models/response/PageResponse';
import { SalleResponse } from 'src/app/core/services/models/response/SalleResponse';
import { SalleService } from 'src/app/core/services/salle.service';
import { ToastService } from 'src/app/shared/toast/toast.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-salle',
  standalone: true,
  imports: [CommonModule , FormsModule, ReactiveFormsModule, AngularSvgIconModule, paginationComponent],
  templateUrl: './salle.component.html',
  styleUrl: './salle.component.css'
})
export class SalleComponent implements OnInit {

  
visible: boolean = false;
visibleUpdate: boolean = false;
visibleView: boolean = false;

_sallesResponse: PageResponse<SalleResponse> = {};
_currentSalle: SalleResponse | null = null;
_page: number = 0;
_size: number = 5;
_keyword: string = "";

_selectedIds: number[] = [];
_selectAll: boolean = false;

salleForm!: FormGroup;

constructor(private fb: FormBuilder,
   private salleService: SalleService,
   private toastService: ToastService) {}

ngOnInit() {
  this.salleForm = this.fb.group({
    title: ['', Validators.required],
    emplacement: ['', Validators.required],
    disponibilite: [true, Validators.required],
    description: ['', Validators.required]
  });
  this.onSearch();
}

onSearch(){
  this.salleService.search(this._page, this._size, this._keyword).subscribe({
    next: (response) => {
      console.log(response.body);
        if (response.body) {
          this._sallesResponse = response.body;
        } else {
          this.toastService.show('Pas de salles de réunions trouvés', 'WARNING');
        }
    },
    error: (err) => {
      console.error(err);
      this.toastService.show('Error lors de la récupération de salles de réunions.', 'DANGER');
    }
  })
}



onSubmit(): void {
  if (this.salleForm.invalid) {
    this.toastService.show('Veuillez remplir tous les champs requis.', 'DANGER');
    return;
  }

    const request: SalleRequest = {
      title: this.salleForm.get('title')?.value,
      description: this.salleForm.get('description')?.value,
      emplacement: this.salleForm.get('emplacement')?.value,
      disponibilite: this.salleForm.get('disponibilite')?.value,
      lastModifiedBy: 1,
    }

  if(this._currentSalle?.id){
    this.salleService.update(this._currentSalle.id, request).subscribe({
      next: (response) => {
        console.log(response);
          this.toastService.show('Salle de réunion modifiée avec success', 'SUCCESS');
          this.salleForm.reset();
          this.onSearch();
          this._currentSalle = null;
      },
      error: (err) => {
        console.error(err);
        this.toastService.show("Error lors de la modification d'une salle de réunion.", 'DANGER');
      }
    });
  } else {
    request.createdBy = 2;
    this.salleService.save(request).subscribe({
      next: (response) => {
        console.log(response);
          this.toastService.show('Nouvelle salle de réunion ajoutée avec success', 'SUCCESS');
          this.salleForm.reset();
          this.onSearch();
          this._currentSalle = null;
      },
      error: (err) => {
        console.error(err);
        this.toastService.show("Error lors de l'ajout d'une nouvelle salle de réunion.", 'DANGER');
      }
    });
  }
  this.visible = false;
  this.visibleUpdate = false;
}

openModal() {
  this.visible = true;
  this.visibleUpdate = false;
  this._currentSalle = null;
}

openModalView(salle: SalleResponse) {
  this._currentSalle = salle;
  this.visibleView = true;
}

openModalUpdate(salle: SalleResponse) {
  this._currentSalle = salle;
  this.visible = false;
  this.visibleUpdate = true;
    this.salleForm = this.fb.group({
    title: [salle.title, Validators.required],
    emplacement: [salle.emplacement, Validators.required],
    disponibilite: [salle.disponibilite, Validators.required],
    description: [salle.description, Validators.required]
  });
}

onSearchSalles(){
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
      this._selectAll = false; 
    }
      if (
        this._selectedIds.length === (this._sallesResponse?.content?.length ?? 0)
      ) {
        this._selectAll = true;
      }
  }

  onToggleSelectAll(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this._selectAll = checked;
  
    if (checked) {
      this._selectedIds = this._sallesResponse?.content?.map(c => c.id) ?? [];
    } else {
      this._selectedIds = [];
    }
  }
  
  cancel() {
    this.visible = false;
    this.visibleUpdate = false;
    this.visibleView = false;
    this._currentSalle = null;
    this.salleForm.reset(); 
  }
  
  
  deleteSelectedSalle() {
        if(this._selectedIds.length === 0) {  
              Swal.fire({
                icon: 'warning',
                title: 'Aucune salle de réunion sélectionné',
                text: 'Veuillez sélectionner au moins une salle de réunion.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6',
              });
              return;
        } else {
              Swal.fire({
                  title: `Voulez-vous supprimer ${this._selectedIds.length} salle(s) ?`,
                  text: 'Cette action est irréversible.',
                  icon: 'warning',
                  showCancelButton: true,
                  confirmButtonColor: '#dc2626', // rouge (danger)
                  cancelButtonColor: '#6b7280', // gris (neutre)
                  confirmButtonText: 'Oui, supprimer',
                  cancelButtonText: 'Annuler',
                }).then((result) => {
                  if (result.isConfirmed) {
                    this.salleService.deleteMany(this._selectedIds).subscribe({
                          next: (response) => {
                              console.log(response)
                              this.toastService.show(`${this._selectedIds.length} salle(s) supprimée(s) avec succès !`, 'SUCCESS');
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
