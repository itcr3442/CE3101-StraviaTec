import { Component } from '@angular/core';
import { RoleLevels } from 'src/app/constants/user.constants';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent {

  RoleLevels = RoleLevels; //  accessible in html
  role: RoleLevels | null = null;
  authenticated: boolean = false;

  constructor(private authService: AuthService) {
    this.refresh_auth()
  }

  ngDoCheck(): void {
    this.refresh_auth()
  }

  refresh_auth(): void {
    this.authenticated = this.authService.isLoggedIn()
    if (this.authenticated) {
      this.role = this.authService.getRole()
    }
  }

  logout(): void {
    this.authService.logout()
  }


}
