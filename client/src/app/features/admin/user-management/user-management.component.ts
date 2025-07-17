import { Component, inject, OnInit } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../shared/models/users';
import { UserParams } from '../../../shared/models/userParams';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-management',
  imports: [RouterLink, MatPaginator],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent implements OnInit {
  private userService = inject(UserService);
   userParams = new UserParams();
   users: User[] = []
   totalUsers = 0;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers(this.userParams).subscribe({
      next: usersData => {this.users = usersData.data;
        this.totalUsers = usersData.count
      }
    })
  }

  onPageChange(event: PageEvent) {
      this.userParams.pageNumber = event.pageIndex + 1;
      this.userParams.pageSize = event.pageSize;
      this.loadUsers();
    }
}
