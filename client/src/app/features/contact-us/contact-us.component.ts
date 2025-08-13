import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { SnackbarService } from '../../core/services/snackbar.service';
import { AdminService } from '../../core/services/admin.service';
import { NgIf } from '@angular/common';
import { RecaptchaModule } from 'ng-recaptcha-angular19';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-contact-us',
  imports: [ReactiveFormsModule, MatProgressSpinnerModule, NgIf, RecaptchaModule, MatButton],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.scss'
})
export class ContactUsComponent {
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);
  private router = inject(Router);
  private snack = inject(SnackbarService);

  validationErrors?: string[];
  loading = false;
  selectedFile?: File;
  captchaToken = '';

  contactForm = this.fb.group({
  name: ['', Validators.required],
  email: ['', [Validators.required, Validators.email]],
  message: ['', Validators.required],
  file: [null]
  });


  onCaptchaResolved(token:string | null) {
    this.captchaToken = token ?? '';
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/jpeg', 'image/jpg'
      ];
      if (!allowedTypes.includes(file.type)) {
        this.snack.error('Only PDF, DOCX, XLSX, PNG, JPG files are allowed.');
        (event.target as HTMLInputElement).value = ''; // reset
        return;
      }
      if (file.size > 1024 * 1024) {
        this.snack.error('File size must be less than 1 MB.');
        (event.target as HTMLInputElement).value = ''; // reset
        return;
      }
      this.selectedFile = file;
    }
  }

    onSubmit() {
      console.log(this.contactForm);
    if (this.contactForm.invalid || !this.captchaToken) {
      this.snack.error('Please complete the form and CAPTCHA.');
      return;
    }
    this.loading = true;
    const formData = new FormData();
    formData.append('name', this.contactForm.get('name')?.value ?? '');
    formData.append('email', this.contactForm.get('email')?.value ?? '');
    formData.append('message', this.contactForm.get('message')?.value ?? '');
    formData.append('captchaToken', this.captchaToken);

    if (this.selectedFile) {
      formData.append('attachment', this.selectedFile);
    }
    this.adminService.sendContactMessage(formData).subscribe({
      next: (res) => {
        console.log('Response:', res);
        this.contactForm.reset();
        this.selectedFile = undefined;
        this.snack.success("Message Sent Successfully!");
        this.loading = false
        this.router.navigateByUrl('/');
        }
      ,
      error: (err) => {
        console.error('Error', err.message);
        this.snack.error("Failed to send message.");
        this.loading = false;
        }
      }
    )
    }
  }



