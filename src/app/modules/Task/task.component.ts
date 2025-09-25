import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { paginationComponent } from 'src/app/core/commons/pagination/pagination.component';
import { TaskRequest } from 'src/app/core/services/models/request/TaskRequet';
import { PageResponse } from 'src/app/core/services/models/response/PageResponse';
import { TaskResponse } from 'src/app/core/services/models/response/TaskResponse';
import { TaskService } from 'src/app/core/services/task.service';
import { ToastService } from 'src/app/shared/toast/toast.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [CommonModule , FormsModule, ReactiveFormsModule, AngularSvgIconModule, paginationComponent],
  templateUrl: './task.component.html',
  styleUrl: './task.component.css'
})
export class TaskComponent implements OnInit {

  
visible: boolean = false;
visibleUpdate: boolean = false;
visibleView: boolean = false;
visibleChangeStatusModal: boolean = false;

taskForm!: FormGroup;
taskStatusForm!: FormGroup;

selectedFile: File | null = null;
fileError: boolean = false;
_statusTask = [{id:1, title:'À faire'},{id:2, title:'En cours'},{id:3, title:'Sans suite'}, {id:4, title:'Terminée'}];
_statusAffected= [{id:1, name:'User 1'},{id:2, name:'User 2'},{id:3, name:'User 3'}, {id:4, name:'User 4'}];

_tasksResponse: PageResponse<TaskResponse> = {};
_currentTask: TaskResponse | null = null;
_page: number = 0;
_size: number = 5;
_keyword: string = "";
_selectedIds: number[] = [];
_selectAll: boolean = false;

constructor(private fb: FormBuilder, 
  private taskService: TaskService,
  private toastService: ToastService) {}

ngOnInit() {
  this.onSearch();
  this.taskForm = this.fb.group({
    title: ['', Validators.required],
    descriptionCreation: ['', Validators.required],
    status: ['', Validators.required],
    dateDebut: ['', Validators.required],
    dateFin: ['', Validators.required],
    idAffected: ['', Validators.required]
  });

  this.taskStatusForm = this.fb.group({
    descriptionUpdate: ['', Validators.required],
    status: ['', Validators.required]
  });

  
  this.taskStatusForm.get('status')?.valueChanges.subscribe((status) => {
    if (status === 'Terminée') {
      this.fileError = !this.selectedFile;
    } else {
      this.fileError = false;
    }
  });

}

onSearch(){
  this.taskService.search(this._page, this._size, this._keyword).subscribe({
    next: (response) => {
      console.log(response.body);
        if (response.body) {
          this._tasksResponse = response.body;
        } else {
          this.toastService.show('Pas de taches trouvés', 'WARNING');
        }
    },
    error: (err) => {
      console.error(err);
      this.toastService.show('Error lors de la récupération de taches.', 'DANGER');
    }
  })
}


onFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    this.selectedFile = input.files[0];
    this.fileError = false;
  } else {
    this.selectedFile = null;
    this.fileError = true;
  }
}


onSubmit(): void {
  if (this.taskForm.invalid) {
    this.toastService.show('Veuillez remplir tous les champs requis.', 'DANGER');
    return;
  }

    const request: TaskRequest = {
      title: this.taskForm.get('title')?.value,
      descriptionCreation: this.taskForm.get('descriptionCreation')?.value,
      status: this.taskForm.get('status')?.value,
      dateFin: this.taskForm.get('dateFin')?.value,
      idAffected: this.taskForm.get('idAffected')?.value,
      dateDebut: this.taskForm.get('dateDebut')?.value,
      lastModifiedBy: 1,
    }

  if(this._currentTask?.id){
    this.taskService.update(this._currentTask.id, request).subscribe({
      next: (response) => {
        console.log(response);
          this.toastService.show('Tache modifiée avec success', 'SUCCESS');
          this.taskForm.reset();
          this.onSearch();
          this._currentTask = null;
      },
      error: (err) => {
        console.error(err);
        this.toastService.show("Error lors de la modification d'une tache.", 'DANGER');
      }
    });
  } else {
    request.createdBy = 2;
    this.taskService.save(request).subscribe({
      next: (response) => {
        console.log(response);
          this.toastService.show('Nouvelle tache ajoutée avec success', 'SUCCESS');
          this.taskForm.reset();
          this.onSearch();
          this._currentTask = null;
      },
      error: (err) => {
        console.error(err);
        this.toastService.show("Error lors de l'ajout d'une nouvelle task.", 'DANGER');
      }
    });
  }
  this.visible = false;
  this.visibleUpdate = false;
  this.visibleChangeStatusModal = false;
}


onSubmitStatut(): void {
  const status = this.taskStatusForm.value.status;
  const isFileRequired = status === 'Terminée';
  const isFormInvalid = this.taskStatusForm.invalid;
  const isFileMissing = isFileRequired && !this.selectedFile;

  if (isFormInvalid || isFileMissing) {
    this.fileError = isFileMissing;
    this.toastService.show('Veuillez remplir tous les champs requis.', 'DANGER');
    this.taskStatusForm.markAllAsTouched();
    return;
  }

  const proceedWithUpdate = (uploadedFileName: string | null) => {
    const request: TaskRequest = {
      status: this.taskStatusForm.get('status')?.value,
      descriptionUpdate: this.taskStatusForm.get('descriptionUpdate')?.value,
      rapport: uploadedFileName,
    };

    if (this._currentTask) {
      this.taskService.updateStatus(this._currentTask.id, request).subscribe({
        next: () => {
          this.toastService.show('Le statut de la tâche a été modifié avec succès.', 'SUCCESS');
          this.onSearch();
          this.cancel();
        },
        error: (err) => {
          console.error(err);
          this.toastService.show('Erreur lors de la modification du statut.', 'DANGER');
        },
      });
    }
  };

  if (isFileRequired && this.selectedFile) {
    this.taskService.uploadFile(this.selectedFile).subscribe({
      next: (res) => proceedWithUpdate(res),
      error: (err) => {
        console.error(err);
        this.toastService.show('Erreur lors de l’upload du fichier.', 'DANGER');
      },
    });
  } else {
    proceedWithUpdate(null);
  }
}

downloadFile(filename: string): void {
    this.taskService.download(filename).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

openModal() {
  this.visible = true;
  this.visibleUpdate = false;
}

openModalUpdate(task: TaskResponse) {
  this._currentTask = task;
  this.visible = false;
  this.visibleUpdate = true;
    this.taskForm = this.fb.group({
    title: [task.title, Validators.required],
    descriptionCreation: [task.descriptionCreation, Validators.required],
    status: [task.status, Validators.required],
    dateFin: [task.dateFin, Validators.required],
    dateDebut: [task.dateDebut, Validators.required],
    idAffected: [task.idAffected, Validators.required]
  });
}

openModalView(task: TaskResponse) {
  this._currentTask = task;
  this.visible = false;
  this.visibleUpdate = false;
  this.visibleView = true;
}

changeStatus(task: TaskResponse) {
    this.visibleChangeStatusModal = true;
    this._currentTask = task;
    this.taskStatusForm = this.fb.group({
    status: [task.status, Validators.required],
    descriptionUpdate: [task.descriptionUpdate, Validators.required]
  });
}

  onSearchTasks(){
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
          this._selectedIds.length === (this._tasksResponse?.content?.length ?? 0)
        ) {
          this._selectAll = true;
        }
    }
  
    onToggleSelectAll(event: Event) {
      const checked = (event.target as HTMLInputElement).checked;
      this._selectAll = checked;
    
      if (checked) {
        this._selectedIds = this._tasksResponse?.content?.map(c => c.id) ?? [];
      } else {
        this._selectedIds = [];
      }
    }
    
    cancel() {
      this.visible = false;
      this.visibleUpdate = false;
      this.visibleView = false;
      this.visibleChangeStatusModal = false;
      this._currentTask = null;
      this.taskForm.reset(); 
      this.taskStatusForm.reset();
    }
    
    
    deleteSelectedTasks() {
          if(this._selectedIds.length === 0) {  
                Swal.fire({
                  icon: 'warning',
                  title: 'Aucune Tache sélectionné',
                  text: 'Veuillez sélectionner au moins une tache.',
                  confirmButtonText: 'OK',
                  confirmButtonColor: '#3085d6',
                });
                return;
          } else {
                Swal.fire({
                    title: `Voulez-vous supprimer ${this._selectedIds.length} tache(s) ?`,
                    text: 'Cette action est irréversible.',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#dc2626', // rouge (danger)
                    cancelButtonColor: '#6b7280', // gris (neutre)
                    confirmButtonText: 'Oui, supprimer',
                    cancelButtonText: 'Annuler',
                  }).then((result) => {
                    if (result.isConfirmed) {
                      this.taskService.deleteMany(this._selectedIds).subscribe({
                            next: (response) => {
                                console.log(response)
                                this.toastService.show(`${this._selectedIds.length} tache(s) supprimée(s) avec succès !`, 'SUCCESS');
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
