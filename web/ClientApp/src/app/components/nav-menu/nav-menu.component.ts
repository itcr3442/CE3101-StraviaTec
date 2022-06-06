import { Component } from '@angular/core';
import { of } from 'rxjs';
import { RoleLevels } from 'src/app/constants/user.constants';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent {

  RoleLevels = RoleLevels; //  accessible in html

  constructor(private authService: AuthService) {
  }

  get authenticated(): boolean {
    return this.authService.isLoggedIn()
  }

  get role(): RoleLevels | null {
    if (this.authenticated) {
      return this.authService.getRole()
    }
    else return null
  }

  logout(): void {
    this.authService.logout()
  }


}
