import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {


  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
  }

  /**
 * Función que se llama para salir de la sesión.
 * Esta es llamada al apretar el botón correspondiente.
 */
  logout() {
    this.authService.logout()
    this.router.navigate(['/login'])
  }

}
