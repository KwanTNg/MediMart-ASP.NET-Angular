import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../../core/services/account.service';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    MatCard,
    MatFormField,
    MatInput,
    MatLabel,
    MatButton,
    MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private accountService = inject(AccountService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private snack = inject(SnackbarService);
  baseUrl = environment.apiUrl;
  returnUrl = '/';
  remainingAttempts: number | null = null;
  maxAttempts = 3;

  constructor() {
    const url = this.activatedRoute.snapshot.queryParams['returnUrl'];
    if (url) this.returnUrl = url;
  }

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    code: ['']
  });


  onSubmit() {
    const values = this.loginForm.value;
    this.accountService.login(this.loginForm.value).subscribe({
      next: res => {
        if (res.require2FA) {
          this.router.navigate(['/two-factor-auth'], { queryParams: { email: values.email } });
        } else {
        this.accountService.getUserInfo().subscribe();
        this.router.navigateByUrl(this.returnUrl);
        }
      },
      error: err => {
        if (err.error?.accessFailedCount !== undefined) {
          this.remainingAttempts = this.maxAttempts - err.error.accessFailedCount;

          if (err.error.isLockedOut) {
            this.snack.error('Your account is locked. Please try again later.');
          } else {
            this.snack.error(`Invalid credentials. ${this.remainingAttempts} login attempt(s) remaining.`);
          }
        } else {
          this.snack.error('Login failed.');
        }
      }
    })
  }

  toForgotPassword() {
    this.router.navigateByUrl('/forgot-password');
  }

  loginWithGoogle() {
  window.location.href = this.accountService.loginWithGoogleUrl(); 
}

loginWithGitHub() {
  window.location.href = this.accountService.loginWithGitHubUrl(); 
}

}
