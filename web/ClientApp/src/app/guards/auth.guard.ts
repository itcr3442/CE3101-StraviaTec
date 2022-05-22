import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) { }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const requiredRole = route.data['role'];

    if (this.authService.isLoggedIn() && this.authService.getRole() >= requiredRole) {
      return true
    }

    // navigate to login page if not authenticated      
    this.router.navigate(['/login/redirect']);
    return false;
  }

}    
