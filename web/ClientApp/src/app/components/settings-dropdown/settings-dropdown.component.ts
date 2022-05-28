import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { analyzeAndValidateNgModules } from '@angular/compiler';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
// import { bootstrap } from '';
import { Country, newc_alpha2 } from 'src/app/interfaces/country';
import { NullableUser, User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { RegisterService } from 'src/app/services/register.service';
import { EditProfileFormComponent } from '../edit-profile-form/edit-profile-form.component';

@Component({
  selector: 'app-settings-dropdown',
  templateUrl: './settings-dropdown.component.html',
  styleUrls: ['./settings-dropdown.component.css']
})
export class SettingsDropdownComponent implements OnInit {

  @ViewChild("editForm") editProfileForm: EditProfileFormComponent = {} as EditProfileFormComponent;

  userInfo: User | null = null;
  trigger: number = 0

  constructor(private authService: AuthService, private registerService: RegisterService, private router: Router) {
  }

  ngOnInit(): void {
    this.refreshUser()
  }

  refreshUser(): void {
    this.authService.getUser(0).subscribe((user: User | null) => {
      this.userInfo = user
    })
  }

  /**
 * Función que se llama para salir de la sesión.
 * Esta es llamada al apretar el botón correspondiente.
 */
  logout() {
    this.authService.logout()
  }

  editUser() {
    if (this.userInfo && this.editProfileForm.validateForm()) {
      this.editProfileForm.message = ""

      let current_user = this.userInfo;
      let form = this.editProfileForm;

      let edit_user: NullableUser = {
        username: this.getChange<string | null>(current_user?.username || null, form.username),
        firstName: this.getChange<string | null>(current_user?.firstName || null, form.firstName),
        lastName: this.getChange<string | null>(current_user?.lastName || null, form.lastName),
        birthDate: this.getChange<Date | null>(current_user?.birthDate || null, new Date(form.birthDate)),
        country: this.getChange<Country | null>(current_user?.country || null, newc_alpha2(form.country))
      }

      console.log("User edit:", edit_user)

      this.registerService.edit_user(edit_user).subscribe(
        (resp: HttpResponse<null>) => {

          // Esconder modal si request sirvió
          let myModalEl: HTMLElement | null = document.getElementById('editProfile');
          if (!!myModalEl) {
            // @ts-ignore
            let modal: bootstrap.Modal | null = bootstrap.Modal.getInstance(myModalEl)
            // console.log("modal:", modal)
            modal?.hide();
          }

          let imageURL = null
          if (/*this.*/imageURL != null) {
            //TODO: submit image to server
            URL.revokeObjectURL(/*this.*/imageURL)
          }
        },
        (err: HttpErrorResponse) => {
          if (err.status == 409) {
            this.editProfileForm.message = "Nombre de usuario ya está tomado.";
          } else if (err.status == 400) {
            this.editProfileForm.message = "Bad Request 400: Por favor verifique que los datos ingresados son válidos.";

          } else if (err.status == 404) {
            console.log("404:", err)
            this.editProfileForm.message = "Not Found 404: Estamos experimentando problemas, vuelva a intentar más tarde.";

          }
        })
    }
  }

  getChange<T>(oldThing: T, newThing: T): T | null {
    return newThing !== oldThing ? newThing : null
  }
}