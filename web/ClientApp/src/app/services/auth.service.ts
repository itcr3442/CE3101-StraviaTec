import { Injectable, ɵisObservable } from '@angular/core';
import { RepositoryService } from './repository.service';
import { map } from 'rxjs/operators';
import { Id } from '../interfaces/id';
import { HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

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
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  }
  /**
   * 
   * @returns Revisa que los datos necesarios estén presentes en local storage para decir que el usuario está ingresado
   */
  public isLoggedIn(): boolean {
    if (localStorage.getItem('isLoggedIn') == "true") {
      let token = JSON.parse(localStorage.getItem('token') || '{}')
      if (token.hasOwnProperty('username') && token.hasOwnProperty('uuid')) {
        return true;
      }
    }
    return false;
  }

  /**
   * 
   * @returns El nivel de rol del usuario que está loggeado
   */
  public getRole(): number {
    if (localStorage.getItem('isLoggedIn') == "true") {
      let role = localStorage.getItem('role')
      if (role != null) {
        return +role
      }
    }
    return 0;
  }

  /**
   * Obtiene la info del usuario actual de local storage, llamar después de isLoggedIn()
   * @returns Object con 'id' y 'password' fields
   */
  public getCredentials(): any {
    return JSON.parse(localStorage.getItem('token') || '{}')
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