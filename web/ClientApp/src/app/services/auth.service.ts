import { Injectable, ɵisObservable } from '@angular/core';
import { RepositoryService } from './repository.service';
import { map } from 'rxjs/operators';
import { Id } from '../interfaces/id';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RoleLevels, RoleLevelType } from '../constants/user.constants';
import { CookiesService } from './cookies.service';
import { UserCookieName } from '../constants/cookie.constants';
import { Router } from '@angular/router';

export interface LoginResponse {
  id: number,
  type: RoleLevelType
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private repo: RepositoryService, private cookies: CookiesService, private router: Router) { }

  /**
 * 
 * @param username username del usuario
 * @param password contraseña
 * @returns retorna los datos del usuario
 */
  public login(username: string, password: string): Observable<HttpResponse<LoginResponse>> {

    let credentials = {
      username,
      password
    }

    return this.repo.create<LoginResponse>("Users/Login", credentials, true)
  }

  /**
   * 
   * @returns Revisa que los datos necesarios estén presentes en local storage para decir que el usuario está ingresado
   */
  public isLoggedIn(): boolean {
    let cookie = this.cookies.get_cookie(UserCookieName)
    // console.log("User cookie from isLoggedIn():", cookie)
    if (cookie) {
      return true;
    }

    return false;
  }

  /**
   * 
   * @returns El nivel de rol del usuario que está loggeado
   */
  public getRole(): RoleLevels {
    let cookie = this.cookies.get_cookie(UserCookieName)
    if (cookie) {
      let credentials: LoginResponse = JSON.parse(cookie)
      // console.log("Credentials from getRole():", credentials)
      return RoleLevels[credentials.type];
    }

    return 0;
  }


  /**
 * Obtiene el id del usuario actual de local storage, llamar después de isLoggedIn()
 * @returns Object con 'id'
 */
  public getId(): number {
    //TODO si no hay id entonces revisar login y upatear id
    let cookie = this.cookies.get_cookie(UserCookieName)
    if (cookie) {
      let credentials: LoginResponse = JSON.parse(cookie)
      return credentials.id;
    }

    return 0;
  }


  /**
   * Remueve los cookies que mantienen la sesión del usuario y manda un request de logout al API
   */
  public logout() {
    return this.repo.create<null>("Users/Logout", null, true).subscribe((res: HttpResponse<null>) => console.log("Log out:", res),
      (error: HttpErrorResponse) => {
        console.log("Log out error:", error)
      }

    ).add(() => {
      this.cookies.delete_cookie(UserCookieName, '/')
      this.router.navigate(['/login'])
    })
  }


}