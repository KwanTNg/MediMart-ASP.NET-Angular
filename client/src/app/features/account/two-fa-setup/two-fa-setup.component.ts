import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccountService } from '../../../core/services/account.service';
import { NgIf } from '@angular/common';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { toDataURL } from 'qrcode'; 
import { Router } from '@angular/router';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-two-fa-setup',
  imports: [ReactiveFormsModule, NgIf, MatButton],
  templateUrl: './two-fa-setup.component.html',
  styleUrl: './two-fa-setup.component.scss'
})
export class TwoFaSetupComponent implements OnInit {
  private accountService = inject(AccountService);
  private fb = inject(FormBuilder);
  private snack = inject(SnackbarService);
  private router = inject(Router);

  qrCodeUrl?: string;
  setupForm = this.fb.group({
    code: ['', Validators.required]
  });

  twoFactorEnabled = false;

  ngOnInit() {
    this.accountService.getUserInfo().subscribe({
      next: user => {
        this.twoFactorEnabled = user.twoFactorEnabled;
        if (!this.twoFactorEnabled) {
          this.loadQrCode();
        }
      },
      error: err => console.error(err)
    });
  }

  private async loadQrCode() {
    this.accountService.get2FASetUp().subscribe({
      next: async data => {
        const qrData: string = data.qrCodeUrl
        this.qrCodeUrl = await toDataURL(qrData);
      },
      error: err => console.error(err)
    });
  }

  verifyCode() {
    console.log(this.setupForm.value.code)
    if (this.setupForm.invalid) return;
    this.accountService.verify2FA(this.setupForm.value.code!).subscribe({
      next: () => {this.snack.success('2FA successfully enabled!');
                  this.router.navigateByUrl('/');
      },
      error: () => this.snack.error('Invalid verification code')
    });
  }

  disable2FA() {
    this.accountService.disable2FA().subscribe({
      next: () => {
        this.snack.success('2FA disabled');
        this.twoFactorEnabled = false;
        this.loadQrCode();
        this.router.navigateByUrl('/');
      },
      error: () => this.snack.error('Failed to disable 2FA')
    });
  }
}
