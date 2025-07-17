import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../shared/models/users';
import { NgIf } from '@angular/common';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-user-detail',
  imports: [NgIf, MatButton],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss'
})
export class UserDetailComponent implements OnInit {
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  user?: User;
  loading = false;
  error = '';

  ngOnInit(): void {
    this.loadUser();
  }

  loadUser() {
    this.loading = true;
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'No user ID provided';
      this.loading = false;
      return;
    }

    this.userService.getUser(id).subscribe({
      next: (user) => {
        this.user = user;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load user details.';
        this.loading = false;
      }
    });
  }
  goToMessages(userId: string) {
  this.router.navigate(['/member-messages', userId]); // e.g., /admin/messages/:id
  }

  goBack() {
    this.router.navigate(['/user-management']);
  }
}