import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal} from '@angular/core';
import { environment } from '../../../environments/environment';
import { UserParams } from '../../shared/models/userParams';
import { User } from '../../shared/models/users';
import { PaginatedResult} from '../../shared/models/paginatedResult';
import { tap } from 'rxjs';
import { Pagination } from '../../shared/models/pagination';

@Injectable({
  providedIn: 'root'
})
export class UserService {
 private http = inject(HttpClient);
 private baseUrl = environment.apiUrl;
 user = signal<User | null>(null);
  
 getUsers(userParams : UserParams) {
  let params = new HttpParams();
  params = params.append('pageIndex', userParams.pageNumber);
  params = params.append('pageSize', userParams.pageSize);
  params = params.append('orderBy', userParams.orderBy);
  return this.http.get<Pagination<User>>(this.baseUrl + 'admin/users', {params, withCredentials: true});
 }

 getUser(id: string) {
  return this.http.get<User>(this.baseUrl + 'admin/user/' + id, {withCredentials: true}).pipe(
    tap(user => {
      this.user.set(user)
    })
  )
 }

}
