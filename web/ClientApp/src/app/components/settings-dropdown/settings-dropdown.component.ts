import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { analyzeAndValidateNgModules } from '@angular/compiler';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { RoleLevels } from 'src/app/constants/user.constants';
// import { bootstrap } from '';
import { Country, newc_alpha2 } from 'src/app/interfaces/country';
import { NullableUser, User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { RegisterService } from 'src/app/services/register.service';
import { EditProfileFormComponent } from '../edit-profile-form/edit-profile-form.component';
import { ResetPasswordFormComponent } from '../reset-password-form/reset-password-form.component';

@Component({
  selector: 'app-settings-dropdown',
  templateUrl: './settings-dropdown.component.html',
  styleUrls: ['./settings-dropdown.component.css']
})
export class SettingsDropdownComponent implements OnInit {

  @ViewChild("editForm") editProfileForm!: EditProfileFormComponent;
  @ViewChild("resetForm") resetPasswordForm!: ResetPasswordFormComponent;

  userInfo: User | null = null;
  trigger: number = 0
  RoleLevels = RoleLevels
  loading: boolean = false

  constructor(private authService: AuthService, private registerService: RegisterService, private router: Router) {
  }

  get role(): RoleLevels | null {
    if (this.userInfo) {
      return this.userInfo.type
    }
    return null
  }

  ngOnInit(): void {
    this.refreshUser()


    let myModalEl: HTMLElement | null = document.getElementById('editProfile');
    if (!!myModalEl) {

      let self = this
      myModalEl.addEventListener('hidden.bs.modal', function (event) {
        self.refreshUser()
        self.loading = false
        self.editProfileForm.clearImage()
      })
    }

  }

  refreshUser(): void {
    this.authService.getUser(0).subscribe((user: User | null) => {
      if (user) {
        user.type = this.authService.getRole()
        this.userInfo = user
      }
    })
  }

  deleteUser(): void {
    this.registerService.delete_self().subscribe(
      (resp: HttpResponse<null>) => {
        // this.
        console.log("Cuenta eliminada:", resp)
        // this.router.navigate(['/login'])
        window.location.reload()
      })
  }

  /**
  * Función que se llama para salir de la sesión.
  * Esta es llamada al apretar el botón correspondiente.
  */
  logout() {
    this.authService.logout()
  }

  hideModal(id: string) {
    let myModalEl: HTMLElement | null = document.getElementById(id);
    if (!!myModalEl) {
      // @ts-ignore
      let modal: bootstrap.Modal | null = bootstrap.Modal.getInstance(myModalEl)
      // console.log("modal:", modal)
      modal?.hide();
    }
  }

  resetPassword() {
    if (this.resetPasswordForm.validateForm()) {
      this.resetPasswordForm.message = ""

      this.registerService.reset_password(0, this.resetPasswordForm.old, this.resetPasswordForm.new).subscribe(
        (_: HttpResponse<null>) => {
          this.hideModal('resetPassword')
          this.registerService.resetForm(this.resetPasswordForm.resetForm)
        },
        (err: HttpErrorResponse) => {
          if (err.status === 401) {
            this.resetPasswordForm.message = "La contraseña actual ingresada es incorrecta."
          }
          else {
            console.log("Error inseperado en resetPassword():", err)
          }
        }
      )
    }
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

      this.loading = true
      this.registerService.edit_user(edit_user).subscribe(
        (_: HttpResponse<null>) => {

          //can't submit image to server atm porque endpoint requiere autenticación
          if (this.editProfileForm.imageFile && this.editProfileForm.imageURL) {
            this.registerService.put_pfp(0, this.editProfileForm.imageFile).subscribe((resp: HttpResponse<null>) => {

              // this.editProfileForm.clearImage()
              // Esconder modal si request sirvió
              this.hideModal('editProfile')

              console.log("upload image resp:", resp)
              this.loading = false
              window.location.reload()
            },
              (err: HttpErrorResponse) => {
                console.log("Upload img error:", err)
                this.editProfileForm.message = "El usuario fue registrado, pero hubo un error al cargar la imagen, por favor inténtelo más tarde."
                this.loading = false

              })
          }
          else {
            this.hideModal('editProfile')
            this.loading = false
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
          this.loading = false

        })
    }
  }

  getChange<T>(oldThing: T, newThing: T): T | null {
    return newThing !== oldThing ? newThing : null
  }
}