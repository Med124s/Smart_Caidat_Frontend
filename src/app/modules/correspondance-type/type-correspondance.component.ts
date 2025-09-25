import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { paginationComponent } from 'src/app/core/commons/pagination/pagination.component';
import { TypeRequest } from 'src/app/core/services/models/request/TypeRequest';
import { PageResponse } from 'src/app/core/services/models/response/PageResponse';
import { TypeResponse } from 'src/app/core/services/models/response/TypeResponse';
import { TypeService } from 'src/app/core/services/type.service';
import { ToastService } from 'src/app/shared/toast/toast.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-type-correspondance',
  standalone: true,
  imports: [CommonModule , ReactiveFormsModule, AngularSvgIconModule, paginationComponent, FormsModule],
  templateUrl: './type-correspondance.component.html',
  styleUrl: './type-correspondance.component.css'
})
export class TypeCorrespondanceComponent implements OnInit {

  
visible: boolean = false;
visibleUpdate: boolean = false;
visibleView: boolean = false;


typeForm!: FormGroup;

_typesResponse: PageResponse<TypeResponse> = {};
_currentType: TypeResponse | null = null;
_page: number = 0;
_size: number = 5;
_keyword: string = "";

_selectedIds: number[] = [];
_selectAll: boolean = false;

constructor(private fb: FormBuilder,
   private typeService: TypeService,
   private toastService: ToastService) {}

ngOnInit() {
  this.typeForm = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required]
  });
  this.onSearch();
}

onSearchTypes(){
    this._page = 0;
    this.onSearch();
}

onSearch(){
  this.typeService.search(this._page, this._size, this._keyword).subscribe({
    next: (response) => {
      console.log(response.body);
        if (response.body) {
          this._typesResponse = response.body;
        } else {
          this.toastService.show('Pas de types trouvés', 'WARNING');
        }
    },
    error: (err) => {
      console.error(err);
      this.toastService.show('Error lors de la récupération de types.', 'DANGER');
    }
  })
}

onSubmit(): void {

  if (this.typeForm.invalid) {
    this.toastService.show('Veuillez remplir tous les champs requis.', 'DANGER');
    return;
  }
    const request: TypeRequest = {
      title: this.typeForm.get('title')?.value,
      description: this.typeForm.get('description')?.value,
      lastModifiedBy: 1,
    }

  if(this._currentType?.id){
    this.typeService.update(this._currentType.id, request).subscribe({
      next: (response) => {
        console.log(response);
          this.toastService.show('Type de correspondance modifié avec success', 'SUCCESS');
          this.typeForm.reset();
          this.onSearch();
          this._currentType = null;
      },
      error: (err) => {
        console.error(err);
        this.toastService.show("Error lors de la modification d'un type de correspondance.", 'DANGER');
      }
    });
  } else {
    request.createdBy = 2;
    this.typeService.save(request).subscribe({
      next: (response) => {
        console.log(response);
          this.toastService.show('Nouveau type de correspondance ajouté avec success', 'SUCCESS');
          this.typeForm.reset();
          this.onSearch();
          this._currentType = null;
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
  this._currentType = null;
}

openModalView(type: TypeResponse) {
  this.visibleView = true;
  this._currentType = type;
}

openModalUpdate(type: TypeResponse) {
  this.visible = false;
  this.visibleUpdate = true;
  this._currentType = type;
    this.typeForm = this.fb.group({
    title: [type.title, Validators.required],
    description: [type.description, Validators.required]
  });
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
      this._selectedIds.length === (this._typesResponse?.content?.length ?? 0)
    ) {
      this._selectAll = true;
    }
}
onToggleSelectAll(event: Event) {
  const checked = (event.target as HTMLInputElement).checked;
  this._selectAll = checked;

  if (checked) {
    this._selectedIds = this._typesResponse?.content?.map(c => c.id) ?? [];
  } else {
    this._selectedIds = [];
  }
}

cancel() {
  this.visible = false;
  this.visibleUpdate = false;
  this.visibleView = false;
  this._currentType = null;
  this.typeForm.reset(); 
}


deleteSelectedType() {
      if(this._selectedIds.length === 0) {  
            Swal.fire({
              icon: 'warning',
              title: 'Aucun type sélectionné',
              text: 'Veuillez sélectionner au moins un type.',
              confirmButtonText: 'OK',
              confirmButtonColor: '#3085d6',
            });
            return;
      } else {
            Swal.fire({
                title: `Voulez-vous supprimer ${this._selectedIds.length} type(s) ?`,
                text: 'Cette action est irréversible.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#dc2626', // rouge (danger)
                cancelButtonColor: '#6b7280', // gris (neutre)
                confirmButtonText: 'Oui, supprimer',
                cancelButtonText: 'Annuler',
              }).then((result) => {
                if (result.isConfirmed) {
                  this.typeService.deleteMany(this._selectedIds).subscribe({
                        next: (response) => {
                            console.log(response)
                            this.toastService.show(`${this._selectedIds.length} type(s) supprimé(s) avec succès !`, 'SUCCESS');
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
