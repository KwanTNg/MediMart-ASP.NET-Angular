import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../../../core/services/account.service';
import { SnackbarService } from '../../../../core/services/snackbar.service';

@Component({
  selector: 'app-confirm-email',
  imports: [],
  templateUrl: './confirm-email.component.html',
  styleUrl: './confirm-email.component.scss'
})
export class ConfirmEmailComponent implements OnInit {
  private accountService = inject(AccountService);
  private activatedRoute = inject(ActivatedRoute);
  private snack = inject(SnackbarService);
  private router = inject(Router);
  res: any;

  ngOnInit(): void {
   this.confirmEmail();
  }

    confirmEmail() {
    const uid = this.activatedRoute.snapshot.queryParamMap.get('uid');
    const token = this.activatedRoute.snapshot.queryParamMap.get('token');

    if (!uid || !token) {
      this.snack.error('Invalid confirmation link');
      this.router.navigateByUrl('/account/register');
      return;
  }
    this.accountService.confirmEmail(uid, token).subscribe({
      next: res => {
        this.res = res;
        this.snack.success('Email confirmed!');
        this.accountService.clearUserEmail();
        this.router.navigateByUrl('/account/login');
      },
      error: error => {
        this.snack.error(error?.error || 'Email confirmation failed.');
        this.router.navigateByUrl('/account/register');
      }
    })
  }

}
