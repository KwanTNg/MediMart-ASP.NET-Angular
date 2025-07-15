import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccountService } from '../../../core/services/account.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { SnackbarService } from '../../../core/services/snackbar.service';

@Component({
  selector: 'app-two-factor-auth',
  imports: [
    ReactiveFormsModule,
    MatCard,
    MatFormField,
    MatInput,
    MatLabel,
    MatButton
  ],
  templateUrl: './two-factor-auth.component.html',
  styleUrl: './two-factor-auth.component.scss'
})
export class TwoFactorAuthComponent implements OnInit {
  private fb = inject(FormBuilder);
  private accountService = inject(AccountService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private snack = inject(SnackbarService);
  form = this.fb.group({
    email: ['', Validators.required],
    code: ['', Validators.required]
  });
  returnUrl = '/';
  validationErrors?: string[];

  ngOnInit() {
    const url = this.activatedRoute.snapshot.queryParams['returnUrl'];
    if (url) this.returnUrl = url;

    const email = this.activatedRoute.snapshot.queryParams['email'];
    if (email) {
      this.form.patchValue({email});
    }
  }

  verify2FA() {
    console.log(this.form.value);
    this.accountService.verify2FALogin(this.form.value).subscribe({
      next: () => {
      this.accountService.getUserInfo().subscribe();
        this.router.navigateByUrl(this.returnUrl);
    }, error: errors => {this.validationErrors = errors;
        if (Array.isArray(errors)) {
        errors.forEach(err => this.snack.error(err)); // or just show the first one
        // this.snack.error(errors[0]);
      } else {
        this.snack.error('Invalid code');
      }

    },

  } );
  
  }
}
