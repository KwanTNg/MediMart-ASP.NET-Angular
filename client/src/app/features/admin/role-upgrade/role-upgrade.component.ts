import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { Router, ActivatedRoute } from '@angular/router';
import { AccountService } from '../../../core/services/account.service';
import { SnackbarService } from '../../../core/services/snackbar.service';

@Component({
  selector: 'app-role-upgrade',
  imports: [
    ReactiveFormsModule,
    MatCard,
    MatFormField,
    MatInput,
    MatLabel,
    MatButton
  ],
  templateUrl: './role-upgrade.component.html',
  styleUrl: './role-upgrade.component.scss'
})
export class RoleUpgradeComponent {
  private fb = inject(FormBuilder);
  private accountService = inject(AccountService);
  private router = inject(Router);
  private snack = inject(SnackbarService);
  

  roleUpgradeForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    newRole: ['', Validators.required]
  });


  onSubmit() {
    this.accountService.roleUpgrade(this.roleUpgradeForm.value).subscribe({
      next: () => {
        this.snack.success('Role upgrade successful');
        this.router.navigateByUrl('/');
      }
    })
  }
}
