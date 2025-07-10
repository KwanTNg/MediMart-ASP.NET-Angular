import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AccountService } from '../services/account.service';
import { map, of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const accountService = inject(AccountService);
  const router = inject(Router);

  if (accountService.currentUser()) {
    return of(true);
  } else {
    //If the user is logined, but the getUserInfo function is not called or currentUser() data is lost
    //after a page reload, then getAuthState is a fallback
    return accountService.getAuthState().pipe(
      map(auth => {
        if (auth.isAuthenticated) {
          //no need to use (of) as it already return an observable
          return true
        } else {
          //is used to redirect the user to the login page, while preserving the URL they originally wanted to visit
           router.navigate(['/account/login'], {queryParams: {returnUrl: state.url}});
          return false;
        }
        })
      )
    }
  }
