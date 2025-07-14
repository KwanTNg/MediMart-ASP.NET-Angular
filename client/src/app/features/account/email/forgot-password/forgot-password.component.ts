import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountService } from '../../../../core/services/account.service';
import { SnackbarService } from '../../../../core/services/snackbar.service';
import { MatFormFieldModule, MatLabel, MatError } from "@angular/material/form-field";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { NgIf } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-forgot-password',
  imports: [MatFormFieldModule, MatLabel, ReactiveFormsModule, MatError, MatProgressSpinnerModule, NgIf, MatInputModule, MatButton],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private accountService = inject(AccountService);
  private snack = inject(SnackbarService);
  private router = inject(Router);

loading = false;
  emailSent = false;

  forgotForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    emailSent: [false]
  });

  onSubmit() {
    if (this.forgotForm.invalid) return;
    const email = this.forgotForm.get('email')?.value;
    const emailSent = this.forgotForm.get('emailSent')?.value ?? false;

  if (!email) return;
    this.loading = true;

    this.accountService.forgotPassword({email: email, emailSent: emailSent}).subscribe({
      next: () => {
        this.loading = false;
        this.emailSent = true;
        this.snack.success('If the email exists, a reset link has been sent.');
      },
      error: () => {
        this.loading = false;
        this.snack.error('Something went wrong. Please try again.');
      }
    });
  }

  backToLogin() {
    this.router.navigateByUrl('/account/login');
  }
}
