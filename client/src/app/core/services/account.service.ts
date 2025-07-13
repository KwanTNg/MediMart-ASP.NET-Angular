import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Address, User } from '../../shared/models/users';
import { map, tap } from 'rxjs';
import { Injector } from '@angular/core';
import { CartService } from './cart.service'; // still import normally
import { SignalrService } from './signalr.service';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  baseUrl = environment.apiUrl;
  private http = inject(HttpClient);
  private injector = inject(Injector);
  private signalrService = inject(SignalrService); 
  currentUser = signal<User | null>(null);
  isAdmin = computed(() => {
    const roles = this.currentUser()?.roles;
    return Array.isArray(roles) ? roles.includes('Admin') : roles === 'Admin';
  })
  
  login(values: any) {
    let params = new HttpParams();
    params = params.append('useCookies', true);
    //It uses the default identity route
    return this.http.post<User>(this.baseUrl + 'login', values, {params, withCredentials: true}).pipe(
      tap(() => this.signalrService.createHubConnection())
    )
  }

  register(values: any) {
    return this.http.post(this.baseUrl + 'account/register', values);
  }

  roleUpgrade(values: any) {
    return this.http.put(this.baseUrl + 'account/change-role', values, {withCredentials: true});
  }

  getUserInfo() {
    return this.http.get<User>(this.baseUrl + 'account/user-info', {withCredentials: true}).pipe(
      map(user => {
        this.currentUser.set(user);
        return user;
      })
    )
  }

  getAuthState() {
    return this.http.get<{isAuthenticated: boolean}>(this.baseUrl + 'account/auth-status');
  }

  logout() {
    const cartService = this.injector.get(CartService); // Lazy injection
    cartService.cart.set(null); // Access the signal safely
    return this.http.post(this.baseUrl + 'account/logout', {}, {withCredentials: true}).pipe(
      tap(() => this.signalrService.stopHubConnection())
    );
  }

  updateAddress(address: Address) {
    return this.http.post(this.baseUrl + 'account/address', address, {withCredentials: true}).pipe(
      tap(() => {
        this.currentUser.update(user => {
          if (user) user.address = address;
          return user;
        })
      })
    )
  }

  
}
