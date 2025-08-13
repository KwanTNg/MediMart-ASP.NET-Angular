import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { Router, RouterLink } from '@angular/router';
import { AccountService } from '../../../core/services/account.service';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { TextInputComponent } from '../../../shared/components/text-input/text-input.component';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgClass, NgIf } from '@angular/common';

export function matchPasswords(password: string, confirmPassword: string): ValidatorFn {
  return (control: AbstractControl) => {
    const pass = control.get(password)?.value;
    const confirmPass = control.get(confirmPassword)?.value;
    return pass === confirmPass ? null : { passwordMismatch: true };
  };
}

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    MatCard,
    MatButton,
    TextInputComponent,
    MatCheckbox,
    MatProgressSpinnerModule,
    RouterLink,
    NgClass,
    NgIf
],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})

export class RegisterComponent {
  private fb = inject(FormBuilder);
  private accountService = inject(AccountService);
  private router = inject(Router);
  private snack = inject(SnackbarService);
  validationErrors?: string[];
  loading = false;

  registerForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    confirmPassword: ['', Validators.required],
    agree: [false, Validators.requiredTrue]
  }, { validators: matchPasswords('password', 'confirmPassword') });

  onSubmit() {
    if (this.registerForm.invalid) return;
    this.loading = true;

    // We don't need to send confirmPassword to backend
    const { confirmPassword, ...formValue } = this.registerForm.value;
    this.accountService.register(formValue).subscribe({
      next: () => {
        this.snack.success('Registration successful - you can now login');
        const email = this.registerForm.get('email')?.value;
        if (email) {
          this.accountService.setUserEmail(email);
        }
        this.router.navigateByUrl('/register-confirm');
      },
      error: errors => {this.validationErrors = errors;
        if (Array.isArray(errors)) {
        errors.forEach(err => this.snack.error(err)); // or just show the first one
        // this.snack.error(errors[0]);
      } else {
        this.snack.error('An unexpected error occurred');
      }

    },
    complete: () => {
      this.loading = false;
    }
  })
}

loginWithGoogle() {
  window.location.href = this.accountService.loginWithGoogleUrl(); 
}

loginWithGitHub() {
  window.location.href = this.accountService.loginWithGitHubUrl(); 
}
}
