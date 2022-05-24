import { Injectable, ɵisObservable } from '@angular/core';
import { RepositoryService } from './repository.service';
import { map } from 'rxjs/operators';
import { Id } from '../interfaces/id';
import { HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RoleLevels } from '../constants/user.constants';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private repo: RepositoryService) { }

  /**
   * Remueve los datos de local storage que mantienen la sesión del usuario
   */
  public logout(): void {
    localStorage.setItem('isLoggedIn', 'false');
    localStorage.removeItem('id');
    // localStorage.removeItem('role');
  }
  /**
   * 
   * @returns Revisa que los datos necesarios estén presentes en local storage para decir que el usuario está ingresado
   */
  public isLoggedIn(): boolean {
    //TODO: Cambiar esto para usar cookies
    if (localStorage.getItem('isLoggedIn') == "true") {
      let id = JSON.parse(localStorage.getItem('id') || 'null')
      if (id) {
        return true;
      }
    }
    localStorage.setItem('isLoggedIn', 'false')
    return false;
  }

  /**
   * 
   * @returns El nivel de rol del usuario que está loggeado
   */
  public getRole(): RoleLevels {
    return RoleLevels.Athlete

    // if (localStorage.getItem('isLoggedIn') == "true") {
    //   let role = localStorage.getItem('role')
    //   if (role != null) {
    //     return +role
    //   }
    // }
    // return 0;
  }

  /**
   * Obtiene la info del usuario actual de local storage, llamar después de isLoggedIn()
   * @returns Object con 'id' y 'password' fields
   */
  // public getCredentials(): any {
  //   return JSON.parse(localStorage.getItem('token') || '{}')
  // }

  /**
 * Obtiene la info del usuario actual de local storage, llamar después de isLoggedIn()
 * @returns Object con 'id'
 */
  public getCredentials(): Id {
    //TODO si no hay id entonces revisar login y upatear id
    return JSON.parse(localStorage.getItem('id') || '{}')
  }


  /**
   * 
   * @param username username del usuario
   * @param password contraseña
   * @returns retorna los datos del usuario
   */
  public login(username: string, password: string): Observable<HttpResponse<Id>> {

    let credentials = {
      username,
      password
    }

    return this.repo.create<Id>("Users/Login", credentials)
  }
}