import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service'
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RepositoryService } from 'src/app/services/repository.service';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Id } from 'src/app/interfaces/id';

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
  loginMsg: string = ""
  // para errores más que todo
  message: string = ""
  // estado del usuario

  constructor(
    private router: Router,
    private authService: AuthService,
    private repo: RepositoryService
  ) {
    if (authService.isLoggedIn()) {
      this.router.navigate(['/'])
    }
  }

  refresh(): void {
    if (this.router.url === "/login/redirect") {
      this.router.navigate(['/login'])
    }
    else {
      window.location.reload()
    }
  }

  ngOnInit(): void {
    // this.logged = this.authService.isLoggedIn()

    if (this.router.url === "/login/redirect") {
      this.message = "Debe ingresar al sistema para poder acceder a esa página"
    }
  }

  get username() {
    return this.loginForm.controls['username'].value
  }

  get password() {
    return this.loginForm.controls['password'].value
  }
  /**
   * Función que se llama para salir de la sesión.
   * Esta es llamada al apretar el botón correspondiente.
   */
  // logout() {
  //   this.authService.logout()
  //   this.logged = false
  //   this.refresh()
  // }
  /**
  * Método que se llama para verificar con el servido si los datos introducidos
  * son válidos para el inicio de sesión.
  */
  onSubmit() {
    if (this.loginForm.valid) {

      this.authService.login(this.username, this.password).subscribe(
        (res: HttpResponse<Id>) => {
          this.loginMsg = ""
          console.log("login resp:", res)

          if (res.body?.id) {
            localStorage.setItem('id', res.body?.id + "")
            localStorage.setItem('isLoggedIn', 'true');
          }
          else {
            this.loginMsg = "Estamos experimentando dificultades, vuelva a intentar más tarde.\n(Error: No id in response body)";
          }
          this.router.navigate(['/'])
          // this.logged = true
          // this.loginMsg = ""
          // this.repo.getData("users/" + res)
          //   .subscribe((result: any) => {
          //     console.log("ADJJD", result)
          //     localStorage.setItem('role', result.body.type)
          //     this.refresh()
          //   })
        },
        (error: HttpErrorResponse) => {
          console.log("login error:", error)
          this.loginMsg = "Cédula o contraseña incorrectos";
        }
      )
    }
    else {
      this.loginMsg = "Por favor verifique que ingresó todos los campos";
    }
  }
}
