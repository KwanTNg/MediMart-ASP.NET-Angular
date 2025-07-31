import { NgFor } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';


@Component({
  selector: 'app-change-user-role-dialog',
  imports: [
    MatDialogModule,
    MatFormField,
    MatLabel,
    MatSelectModule,
    MatButton,
    MatOptionModule,
    NgFor
  ],
  templateUrl: './change-user-role-dialog.component.html',
  styleUrl: './change-user-role-dialog.component.scss'
})
export class ChangeUserRoleDialogComponent {
  private dialogRef = inject(MatDialogRef<ChangeUserRoleDialogComponent>);
  data = inject(MAT_DIALOG_DATA);

  email: string = this.data.email;
  selectedRole: string = '';
  roles: string[] = ['Pharmacist', 'Director', 'Analyst', 'Admin', 'Patient'];

  submit() {
    this.dialogRef.close({
      email: this.email,
      newRole: this.selectedRole
    })
  }

  cancel() {
    this.dialogRef.close();
  }

}
