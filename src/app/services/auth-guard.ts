import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UserServiceService } from '@app/services/user-service.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private accountService: UserServiceService,
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const user = this.accountService.getUser();
    if (user) {
      // authorised so return true
      return true;
    }

    // not logged in so redirect to login page with the return url
    localStorage.removeItem('user');
    this.accountService.logout();
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
    return false;
  }
}
