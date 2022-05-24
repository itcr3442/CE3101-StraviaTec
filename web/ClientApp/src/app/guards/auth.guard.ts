import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate, Router } from '@angular/router';
import { truncate } from 'fs';
import { RoleLevels } from '../constants/user.constants';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) { }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const requiredRoles: RoleLevels[] = route.data['roles'];

    // console.log("Required Roles:", requiredRoles)
    // console.log("Required Roles length:", requiredRoles.length)

    // Si no se especifican requiredRoles entonces el usuario tiene que estar desloggeado
    if (requiredRoles.length === 0 && !this.authService.isLoggedIn()) {
      return true
    }

    if (this.authService.isLoggedIn()) {
      // Si sí, entonces hay que revisar que el rol del usuario caiga adentro de los posibles roles
      if (requiredRoles.includes(this.authService.getRole())) {
        return true
      }
      else {
        this.router.navigate(['/403']);
      }
    }
    if (this.authService.isLoggedIn() && requiredRoles.includes(this.authService.getRole())) {
      return true
    }

    // navigate to 401 page if not authenticated
    this.router.navigate(['/401']);
    return false;
  }

}    
