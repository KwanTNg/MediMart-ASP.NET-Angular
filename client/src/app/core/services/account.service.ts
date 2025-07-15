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
  private emailKey = 'user-email';
  
  login(values: any) {
    let params = new HttpParams();
    params = params.append('useCookies', true);
    //It uses the default identity route
    return this.http.post<User>(this.baseUrl + 'account/login', values, {params, withCredentials: true}).pipe(
      tap(() => this.signalrService.createHubConnection())
    )
  }

  register(values: any) {
    return this.http.post(this.baseUrl + 'account/register', values);
  }

  get2FASetUp() {
    return this.http.get< {qrCodeUrl: string}>(this.baseUrl + 'account/enable-2fa', {withCredentials:true});
  }

  verify2FA(code: string) {
    return this.http.post(this.baseUrl + 'account/verify-2fa', {code}, {withCredentials:true});
  }

  verify2FALogin(values: any) {
    return this.http.post(this.baseUrl + 'account/2fa-login', values);
  }

  disable2FA() {
    return this.http.post(this.baseUrl + 'account/disable-2fa', {}, { withCredentials: true });
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

  confirmEmail(uid: string, token: string) {
    console.log(uid);
    console.log(token);
    const params = {uid, token};
    return this.http.get(this.baseUrl + 'account/confirm-email', {params});
  }

  resendConfirmationEmail(email: string) {
    return this.http.post(this.baseUrl + 'account/confirm-email', { email });
  }

  setUserEmail(email: string) {
    localStorage.setItem(this.emailKey, email);
  }

  getUserEmail(): string | null {
    return localStorage.getItem(this.emailKey);
  }

  clearUserEmail() {
    localStorage.removeItem(this.emailKey);
  }

  forgotPassword(values: { email: string; emailSent: boolean }) {
    return this.http.post(this.baseUrl + 'account/forgot-password', values);
}

  resetPassword(model: { userId: string, token: string, newPassword: string }) {
  return this.http.post(this.baseUrl + 'account/reset-password', model);
}


  
}
