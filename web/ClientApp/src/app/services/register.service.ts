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

  public delete_user(id: string) {
    return this.repositoryService.delete(
      "Users/" + id)
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

      let id = this.authService.getId()

      return this.repositoryService.edit<null>(
        "Users/" + id, edit_user)
    }
  }

  /**
 * Método que realiza el request al servidor para obtener todos
 * los trabajadores para mostrarlos en la lista correspondiente.
 */
  public getAllUsers = () => {

    return this.repositoryService.getData("users")
  }

  public getUser = (id: string) => {

    return this.repositoryService.getData("users/" + id)
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

  public registerBags = (id: string, owner: string, weight: number, color: string) => {
    let bag = { owner, weight, color }
    console.log("Bag:", bag)
    return this.repositoryService.create("flights/" + id + "/bag", bag)
  }
}
