import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { RepositoryService } from './repository.service';
import { map } from 'rxjs/operators';
import { FormGroup } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { NullableUser, User } from '../interfaces/user';
import { RoleLevels } from '../constants/user.constants';
import { HttpResponse } from '@angular/common/http';
import { Id } from '../interfaces/id';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {

  constructor(private repositoryService: RepositoryService, private authService: AuthService) { }

  public register_user(user: User, password: string): Observable<HttpResponse<Id>> {

    let new_user = {
      "username": user.username,
      password,
      "firstName": user.firstName,
      "lastName": user.lastName,
      "birthDate": user.birthDate.toISOString(),
      "nationality": user.country,
      "type": RoleLevels[user.type]
    }


    console.log("New user: " + JSON.stringify(new_user))

    // return of({ id: 69 })
    return this.repositoryService.create<Id>(
      "Users", new_user)

  }

  public delete_self() {
    return this.repositoryService.delete<null>(
      "Users/0")
  }

  public edit_user(user: NullableUser): Observable<HttpResponse<null>> {
    {
      let edit_user = {
        "username": user.username,
        "firstName": user.firstName,
        "lastName": user.lastName,
        "birthDate": user.birthDate?.toISOString(),
        "nationality": user.country?.alpha2,
      }

      // let id = this.authService.getId()

      return this.repositoryService.edit<null>(
        "Users/0", edit_user)
    }
  }

  /**
   * resetea el formgroup dejando todos sus campos vacíos
   * @param formGroup un formgroup a resetear
   */
  public resetForm = (formGroup: FormGroup) => {
    if (environment.production) {
      Object.values(formGroup.controls).forEach((control) => control.reset())
    }

  }

  public follow_user(followeeId: number): Observable<HttpResponse<null>> {
    return this.repositoryService.create<null>("Following/" + followeeId, null)
  }


  public unfollow_user(followeeId: number): Observable<HttpResponse<null>> {
    return this.repositoryService.delete<null>("Following/" + followeeId)
  }
  
  /* TESTING NO TOCAR
  public register_user_race(raceId: number): Observable<HttpResponse<null>>{
   return this.repositoryService.create<null>("Following/" + followeeId)
  }
  */
}
