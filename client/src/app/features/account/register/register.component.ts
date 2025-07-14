import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { Router } from '@angular/router';
import { AccountService } from '../../../core/services/account.service';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { TextInputComponent } from '../../../shared/components/text-input/text-input.component';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    MatCard,
    MatButton,
    TextInputComponent,
    MatCheckbox,
    MatProgressSpinnerModule
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
    agree: [false, Validators.requiredTrue]
  });

  onSubmit() {
    this.loading = true;
    this.accountService.register(this.registerForm.value).subscribe({
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
}
