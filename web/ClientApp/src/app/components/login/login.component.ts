import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, LoginResponse } from 'src/app/services/auth.service'
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RepositoryService } from 'src/app/services/repository.service';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Id } from 'src/app/interfaces/id';
import { CookiesService } from 'src/app/services/cookies.service';
import { UserCookieName } from 'src/app/constants/cookie.constants';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
/**
 * Componente que contiene la página de inicio de sesión
 */
export class LoginComponent implements OnInit {

  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  })
  // mensaje de login
  warningMsg: string = ""
  // para errores más que todo
  message: string = ""
  // estado del usuario

  constructor(
    private router: Router,
    private authService: AuthService,
    private cookies: CookiesService
  ) {
    if (authService.isLoggedIn()) {
      this.router.navigate(['/'])
    }
  }

  ngOnInit(): void {

  }

  get username() {
    return this.loginForm.controls['username'].value
  }

  get password() {
    return this.loginForm.controls['password'].value
  }

  /**
  * Método que se llama para verificar con el servido si los datos introducidos
  * son válidos para el inicio de sesión.
  */
  onSubmit() {
    if (this.loginForm.valid) {

      this.warningMsg = ""
      this.message = "Cargando..."

      this.authService.login(this.username, this.password).subscribe(
        (res: HttpResponse<LoginResponse>) => {
          this.warningMsg = ""
          console.log("login resp:", res)
          this.message = ""


          if (res.body?.id && res.body.type) {

            this.cookies.setCookie(UserCookieName, JSON.stringify(res.body), 1)
            this.router.navigate(['/'])
            window.location.reload()

          }
          else {
            this.warningMsg = "Estamos experimentando dificultades, vuelva a intentar más tarde.\n(Error: No id in response body)";
          }

        },
        (error: HttpErrorResponse) => {
          console.log("login error:", error)
          this.message = ""
          this.warningMsg = "Cédula o contraseña incorrectos";
        }
      )
    }
    else {
      this.warningMsg = "Por favor verifique que ingresó todos los campos";
    }
  }
}
