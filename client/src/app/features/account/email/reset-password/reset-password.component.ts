import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../../../core/services/account.service';
import { SnackbarService } from '../../../../core/services/snackbar.service';
import { NgIf } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { MatFormFieldModule, MatLabel, MatError } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCard } from '@angular/material/card';


@Component({
  selector: 'app-reset-password',
  imports: [MatFormFieldModule, MatLabel, ReactiveFormsModule, MatError, MatProgressSpinnerModule, NgIf, MatInputModule, MatButton, MatCard],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private accountService = inject(AccountService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snack = inject(SnackbarService);

 resetForm = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(6)]]
  });

  userId = '';
  token = '';

  ngOnInit(): void {
    this.userId = this.route.snapshot.queryParamMap.get('uid') || '';
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
  }

  onSubmit() {
    if (!this.resetForm.valid || !this.userId || !this.token) return;

    const model = {
      userId: this.userId,
      token: this.token,
      newPassword: this.resetForm.value.newPassword!
    };

    this.accountService.resetPassword(model).subscribe({
      next: () => {
        this.snack.success('Password reset successful! You can now login.');
        this.router.navigateByUrl('/account/login');
      },
      error: err => {
        this.snack.error(err.error || 'Password reset failed.');
      }
    });
  }
}

