import { NgIf } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RegisterUser } from 'src/app/shared/models/user.model';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-user',
  imports: [ReactiveFormsModule, FormsModule, NgIf],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css',
})
export class UserComponent implements OnChanges {
  userForm: FormGroup;
  avatarPreview: string | ArrayBuffer | null = null;
  showPassword = false;
  showConfirmPassword = false;

  @Input() visible = false;
  @Input() visibleUpdate = false;
  @Input() user?: RegisterUser;
  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<{ user: RegisterUser; file?: File }>();
  @Output() update = new EventEmitter<{ user: RegisterUser; file?: File }>();

  constructor(private fb: FormBuilder) {
    this.userForm = this.fb.group(
      {
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        confirmPassword: ['', Validators.required],
        password: ['', Validators.required],
        authorities: [["Agent d'autorité"], Validators.required],
        imageUrl: [''],
        publicId: [''],
      },
      {
        validator: this.matchPasswords('password', 'confirmPassword'), // <-- Ajout ici
      },
    );
  }

  matchPasswords(password: string, confirmPassword: string) {
    return (formGroup: FormGroup) => {
      const passControl = formGroup.controls[password];
      const confirmPassControl = formGroup.controls[confirmPassword];

      if (confirmPassControl.errors && !confirmPassControl.errors['mismatch']) {
        return;
      }

      if (passControl.value !== confirmPassControl.value) {
        confirmPassControl.setErrors({ mismatch: true });
      } else {
        confirmPassControl.setErrors(null);
      }
    };
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && this.user && this.visibleUpdate) {
      this.userForm.patchValue({
        firstName: this.user.firstName || '',
        lastName: this.user.lastName || '',
        email: this.user.email || '',
        password: this.user.password || '',
        confirmPassword: this.user.confirmPassword || '',
        authorities: this.user.authorities || [],
        imageUrl: this.user.imageUrl || '',
        publicId: this.user.publicId || '',
      });
      if (this.user.imageUrl) {
        if (this.user.imageUrl.startsWith('/uploads/')) {
          this.avatarPreview = 'http://localhost:8080' + this.user.imageUrl;
        } else {
          this.avatarPreview = this.user.imageUrl;
        }
      } else {
        this.avatarPreview = `https://ui-avatars.com/api/?name=${this.user.firstName}&background=random`;
      }
    }
  }

  selectedFile?: File | undefined;

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

  onSubmit() {
    if (this.userForm.valid) {
      const userData = this.userForm.value;
      let userSaved: RegisterUser = { ...userData };

      if (this.user) {
        console.log('yes');
        userSaved = {
          ...userSaved,
          publicId: this.user.publicId,
          imageUrl: this.user.imageUrl,
          //password: this.user.password,
        };
      }

      if (this.user && userSaved && this.visibleUpdate) {
        this.update.emit({ user: userSaved, file: this.selectedFile });
      } else if (!this.user && userSaved && this.visible) {
        this.create.emit({ user: userSaved, file: this.selectedFile });
      }
      this.resetForm();
      this.cancel();
    } else {
      console.log('Formulaire invalide !');
      this.userForm.markAllAsTouched();
      return;
    }
  }
  cancel() {
    this.resetForm();
    this.close.emit();
  }

  resetForm(): void {
    this.userForm.reset(); // Réinitialise le formulaire
    // Réinitialise les autres champs liés au formulaire
    this.selectedFile = undefined;
    this.avatarPreview = null;
    this.user = {
      publicId: '',
      firstName: '',
      lastName: '',
      email: '',
      imageUrl: '',
      authorities: [],
    };
  }
}
