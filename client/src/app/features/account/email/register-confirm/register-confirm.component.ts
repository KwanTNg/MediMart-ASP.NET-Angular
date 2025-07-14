import { Component, inject, OnInit } from '@angular/core';
import { AccountService } from '../../../../core/services/account.service';
import { NgIf } from '@angular/common';
import { FormBuilder, Validators } from '@angular/forms';
import { SnackbarService } from '../../../../core/services/snackbar.service';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-register-confirm',
  imports: [NgIf, ReactiveFormsModule],
  templateUrl: './register-confirm.component.html',
  styleUrl: './register-confirm.component.scss'
})
export class RegisterConfirmComponent implements OnInit{
  private accountService = inject(AccountService);
  private snack = inject(SnackbarService);
  private fb = inject(FormBuilder);
  form = this.fb.group({
  email: ['', [Validators.required, Validators.email]]
  });
  loading = false;

ngOnInit() {
  const savedEmail = this.accountService.getUserEmail();
  if (savedEmail) {
    this.form.patchValue({ email: savedEmail });
  }
}

  resendConfirmationEmail() {
    if (this.form.invalid) return;
    this.loading = true;

    const email = this.form.value.email!;
    this.accountService.resendConfirmationEmail(email).subscribe({
      next: () => {
        this.snack.success('Confirmation email sent successfully.');
        this.loading = false;
      },
      error: err => {
        this.snack.error(err.error || 'Failed to resend confirmation email.');
        this.loading = false;
      }
    });
  }

}
