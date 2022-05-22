import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { RepositoryService } from './repository.service';
import { map } from 'rxjs/operators';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {

  constructor(private repositoryService: RepositoryService, private authService: AuthService) { }

  public register_user(username: string, password: string, firstName: string, lastName: string, phoneNumber: number, email: string, isStudent: boolean, university: string, studentId: string) {

    let new_user = {
      "type": 0,
      username,
      password,
      firstName,
      lastName,
      phoneNumber,
      email,
      university: isStudent ? university : null,
      studentId: isStudent ? studentId : null
    }

    console.log("New user: " + JSON.stringify(new_user))


    return this.repositoryService.create(
      "users", new_user)

  }

  // TODO: cambiar los parámetros al modelo de trabajador cuando soto termine la base 
  public register_worker(username: string, password: string, firstName: string, lastName: string, phoneNumber: number, email: string) {

    let new_worker = {
      "type": 1,
      username,
      password,
      firstName,
      lastName,
      phoneNumber,
      email,
      university: null,
      studentId: null
    }

    console.log("New worker: " + JSON.stringify(new_worker))


    return this.repositoryService.create(
      "users", new_worker)

  }

  public delete_user(id: string) {
    return this.repositoryService.delete(
      "users/" + id)
  }

  public edit_user(id: string, username: string, password: string, firstName: string, lastName: string, phoneNumber: number, email: string, isStudent: boolean, university: string, studentId: string) {
    {
      let user = {
        username,
        password,
        firstName,
        lastName,
        phoneNumber,
        email,
        university: isStudent ? university : null,
        studentId: isStudent ? studentId : null
      }

      return this.repositoryService.edit(
        "users/" + id, user)
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
    Object.values(formGroup.controls).forEach((control) => control.reset())
  }

  public registerBags = (id: string, owner: string, weight: number, color: string) => {
    let bag = { owner, weight, color }
    console.log("Bag:", bag)
    return this.repositoryService.create("flights/" + id + "/bag", bag)
  }
}
