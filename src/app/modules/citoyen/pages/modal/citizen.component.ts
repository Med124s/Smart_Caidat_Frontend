import { Gender, MaritalStatus } from './../../model/citoyen.model';
import { NgIf } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Citizen } from '../../model/citoyen.model';

@Component({
  selector: 'app-citizen',
  imports: [ReactiveFormsModule, FormsModule, NgIf],
  templateUrl: './citizen.component.html',
  styleUrl: './citizen.component.css',
})
export class CitizenComponent implements OnChanges, OnInit {
  citizenForm: FormGroup;
  avatarPreview: string | ArrayBuffer | null = null;
  selectedFile?: File | undefined;
  showFullImage = false;

  @Input() visible = false;
  @Input() visibleUpdate = false;
  @Input() citizen!: Citizen;
  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<{ citizen: Citizen; file?: File }>();
  @Output() update = new EventEmitter<{ citizen: Citizen; file?: File }>();

  constructor(private fb: FormBuilder) {
    this.citizenForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      cin: ['', Validators.required],
      idcs: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      maritalStatus: ['', Validators.required],
      dateBirth: [null, Validators.required],
      gender: ['', Validators.required],
      imageUrl: [''],
      publicId: [''],
    });
  }
  ngOnInit(): void {
    if (this.visibleUpdate && this.citizen) {
      this.citizenForm.patchValue({ ...this.citizen });
      
    } else {
      this.citizenForm.patchValue({
        maritalStatus: 'SINGLE',
        gender: 'MALE',
        dateBirth: new Date().toISOString().slice(0, 10),
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['citizen'] && this.citizen && this.visibleUpdate) {
      this.citizenForm.patchValue({
        firstName: this.citizen.firstName || '',
        lastName: this.citizen.lastName || '',
        email: this.citizen.email || '',
        cin: this.citizen.cin || '',
        idcs: this.citizen.idcs || '',
        phone: this.citizen.phone || '',
        address: this.citizen.address || '',
        maritalStatus: this.citizen.maritalStatus || '',
        dateBirth: this.citizen.dateBirth || '',
        gender: this.citizen.gender || '',
        imageUrl: this.citizen.imageUrl || '',
        publicId: this.citizen.publicId || '',
      });
      if (this.citizen.imageUrl) {
        if (this.citizen.imageUrl.startsWith('/uploads/')) {
          this.avatarPreview = 'http://localhost:8080' + this.citizen.imageUrl;
        } else {
          this.avatarPreview = this.citizen.imageUrl;
        }
      } else {
        this.avatarPreview = `https://ui-avatars.com/api/?name=${this.citizen.firstName}&background=random`;
      }
    }
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.avatarPreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  openImagePreview() {
    this.showFullImage = true;
  }

  closeImagePreview() {
    this.showFullImage = false;
  }

  onSubmit() {
    if (this.citizenForm.valid) {
      const formValue = this.citizenForm.value;
      const citizenSaved: Citizen = {
        ...formValue,
        dateBirth:
          typeof formValue.dateBirth === 'string'
            ? formValue.dateBirth
            : new Date(formValue.dateBirth).toISOString().slice(0, 10),
      };
      if (this.citizen && this.visibleUpdate) {
        this.update.emit({ citizen: { ...citizenSaved, publicId: this.citizen.publicId }, file: this.selectedFile });
      } else if (!this.citizen && this.visible) {
        this.create.emit({ citizen: citizenSaved, file: this.selectedFile });
      }
      this.resetForm();
      this.cancel();
    } else {
      console.log('Formulaire invalide !');
      this.citizenForm.markAllAsTouched();
    }
  }

  cancel() {
    this.resetForm();
    this.close.emit();
  }

  resetForm(): void {
    this.citizenForm.reset();
    this.selectedFile = undefined;
    this.avatarPreview = null;

    
  // نفرغ citizen تماما باش create.emit يخدم
  this.citizen = undefined as any;

    // Remettre les valeurs par défaut dans le formulaire
    this.citizenForm.patchValue({
      maritalStatus: 'SINGLE',
      gender: 'MALE',
      dateBirth: new Date().toISOString().slice(0, 10)
    });
  }
}
