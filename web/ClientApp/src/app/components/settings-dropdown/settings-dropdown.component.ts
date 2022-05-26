import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-settings-dropdown',
  templateUrl: './settings-dropdown.component.html',
  styleUrls: ['./settings-dropdown.component.css']
})
export class SettingsDropdownComponent implements OnInit {

  userInfo: User | null = null;

  constructor(private authService: AuthService, private router: Router) {
  }

  ngOnInit(): void {
    this.refreshUser()
  }

  refreshUser(): void {
    this.authService.getUser(0).subscribe((user: User | null) => {
      this.userInfo = user
    })
  }

  /**
 * Función que se llama para salir de la sesión.
 * Esta es llamada al apretar el botón correspondiente.
 */
  logout() {
    this.authService.logout()
  }

  editUser() {
    console.log("Edit")
  }

}
