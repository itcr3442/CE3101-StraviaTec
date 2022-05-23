import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate, Router } from '@angular/router';
import { RoleLevels } from '../constants/user.constants';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) { }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const requiredRoles: RoleLevels[] = route.data['roles'];

    if (requiredRoles.length === 0 && !this.authService.isLoggedIn()) {
      return true
    }

    if (this.authService.isLoggedIn() && requiredRoles.includes(this.authService.getRole())) {
      return true
    }

    // navigate to login page if not authenticated
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login/redirect']);
    }
    else {
      this.router.navigate(['/401']);
    }
    return false;
  }

}    
