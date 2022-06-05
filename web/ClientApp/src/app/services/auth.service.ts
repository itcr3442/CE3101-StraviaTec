import { Injectable } from '@angular/core';
import { RepositoryService } from './repository.service';
import { map } from 'rxjs/operators';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RoleLevels, RoleLevelType, } from '../constants/user.constants';
import { CookiesService } from './cookies.service';
import { UserCookieName } from '../constants/cookie.constants';
import { Router } from '@angular/router';
import { User, UserResp, resp2user } from '../interfaces/user';
import { Race, RaceResp, resp2race } from '../interfaces/race';
import { Challenge } from '../interfaces/challenge';
import { GroupResp, groupResp2GroupDisplay, GroupSearchDisplay } from '../interfaces/group';
import { Activity, ActivityResp, resp2activity } from '../interfaces/activity';

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

    return this.repo.create<LoginResponse>("Users/Login", credentials, { skip401: true })
  }

  /**
   * Remueve los cookies que mantienen la sesión del usuario y manda un request de logout al API
   */
  public logout(goToLogin: boolean = true) {
    return this.repo.create<null>("Users/Logout", null, { skip401: true }).subscribe((res: HttpResponse<null>) => console.log("Log out:", res),
      (error: HttpErrorResponse) => {
        console.log("Log out error:", error)
      }

    ).add(() => {
      this.cookies.delete_cookie(UserCookieName, '/')

      if (goToLogin) this.router.navigate(['/login']).then(() => window.location.reload())
      else window.location.reload()
    })
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

  public getUser(id: number): Observable<User | null> {
    return this.repo.getData<UserResp>(`Users/${id}`).pipe(map((resp: HttpResponse<UserResp>) => {
      if (resp.body) {
        let userResp: UserResp = resp.body;

        return resp2user(userResp)
      }
      else {
        this.router.navigate(['/404'])
        return null
      }
    }
    ))

  }

  public getRace(id: number): Observable<Race | null> {
    return this.repo.getData<RaceResp>(`Races/${id}`).pipe(map((resp: HttpResponse<RaceResp>) => {
      if (resp.body) {
        let raceResp: RaceResp = resp.body;

        return resp2race(raceResp)
      }
      else {
        this.router.navigate(['/404'])
        return null
      }

    }
    ))

  }

  public getChallenge(id: number): Observable<Challenge | null> {
    return this.repo.getData<Challenge>(`Challenges/${id}`).pipe(map((resp: HttpResponse<Challenge>) => {
      if (resp.body) {
        let challResp: Challenge = resp.body;

        return challResp
      }
      else {
        this.router.navigate(['/404'])
        return null
      }

    }
    ))

  }

  public getGroup(id: number): Observable<GroupSearchDisplay | null> {
    return this.repo.getData<GroupResp>(`Groups/${id}`).pipe(map((resp: HttpResponse<GroupResp>) => {
      if (resp.body) {
        let groupResp: GroupResp = resp.body;

        return groupResp2GroupDisplay(groupResp, this)
      }
      else {
        this.router.navigate(['/404'])
        return null
      }

    }
    ))
  }

  public getActivity(id: number): Observable<Activity | null> {
    return this.repo.getData<ActivityResp>(`Activities/${id}`).pipe(map((resp: HttpResponse<ActivityResp>) => {
      if (resp.body) {
        let activityResp: ActivityResp = resp.body;

        return resp2activity(activityResp)
      }
      else {
        this.router.navigate(['/404'])
        return null
      }
    }
    ))
  }

  public getFeed(): Observable<HttpResponse<number[]>> {
    return this.repo.getData<number[]>('Feed', { skip404: true })
  }
}