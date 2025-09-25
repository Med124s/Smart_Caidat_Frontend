import { NgIf } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RegisterUser } from 'src/app/shared/models/user.model';
import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { UserSearchService } from '../uikit/pages/table/services/user-search.service';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { Observable } from 'rxjs';
import { State } from 'src/app/shared/models/state.model';

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
  userService = inject(UserSearchService);
  toastService = inject(ToastService);
  @Input() mode: 'create' | 'edit' | 'about' = 'create';

  @Input() user: RegisterUser | any | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<{ user: RegisterUser; file?: File }>();
  @Output() update = new EventEmitter<{ user: RegisterUser; file?: File }>();

  @Output() save = new EventEmitter<{ user: RegisterUser; file?: File | RegisterUser }>();

  constructor(private fb: FormBuilder) {
    this.userForm = this.fb.group(
      {
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required]],
        // password: ['', [Validators.required, this.passwordRulesValidator]],
        confirmPassword: ['', Validators.required],
        authorities: [["Agent d'autorité"], Validators.required],
        imageUrl: [''],
        publicId: [''],
      },
      {
        validators: this.matchPasswords('password', 'confirmPassword'),
      },
    );
  }

  passwordRulesValidator(control: AbstractControl) {
    const value = control.value || '';
    const errors: any = {};

    if (!/[A-Z]/.test(value)) {
      errors.uppercase = true;
    }
    if (!/[a-z]/.test(value)) {
      errors.lowercase = true;
    }
    if (!/[0-9]/.test(value)) {
      errors.number = true;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      errors.special = true;
    }
    if (value.length < 8) {
      errors.minLength = true;
    }

    return Object.keys(errors).length ? errors : null;
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
    if (this.mode === 'create') {
      this.userForm.reset();
    } else if (changes['user'] && this.user) {
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
    if (this.userForm.invalid) return;
    const formValue = this.userForm.value;
    const payload = { ...formValue, publicId: this.user?.publicId };

    let obs$: Observable<State<any>>;
    if (this.mode === 'create') {
      obs$ = this.userService.create(formValue, this.selectedFile);
    } else {
      obs$ = this.userService.update(payload, this.selectedFile);
    }

    obs$.subscribe({
      next: (state) => {
        if (state.status === 'OK' && state.value) {
          this.toastService.show(
            this.mode === 'create' ? 'Utilisateur créé ✅' : 'Utilisateur mis à jour ✅',
            'SUCCESS',
          );
          this.save.emit(state.value);
          this.cancel();
        } else if (state.status === 'ERROR') {
          this.toastService.show(this.mode === 'create' ? 'Erreur création ❌' : 'Erreur mise à jour ❌', 'DANGER');
        }
      },
      error: () => {
        this.toastService.show(this.mode === 'create' ? 'Erreur création ❌' : 'Erreur mise à jour ❌', 'DANGER');
      },
    });
  }

  cancel() {
    // this.resetForm();
    if (this.mode === 'create') {
      this.userForm.reset();
    }
    this.close.emit();
  }

  // resetForm(): void {
  //   this.userForm.reset(); // Réinitialise le formulaire
  //   // Réinitialise les autres champs liés au formulaire
  //   this.selectedFile = undefined;
  //   this.avatarPreview = null;
  //   this.user = {
  //     publicId: '',
  //     firstName: '',
  //     lastName: '',
  //     email: '',
  //     imageUrl: '',
  //     authorities: [],
  //   };
  // }
}
