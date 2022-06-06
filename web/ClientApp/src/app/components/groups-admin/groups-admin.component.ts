import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { of } from 'rxjs';
import { GroupResp } from 'src/app/interfaces/group';
import { Id } from 'src/app/interfaces/id';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { RegisterService } from 'src/app/services/register.service';
import { SearchService } from 'src/app/services/search.service';
import { SearchFieldComponent } from '../search-field/search-field.component';

interface GroupWithAdmin {
  id: number,
  name: string,
  admin: User,
  adminId: number,
  members: number[],
}

const registerTitle = "Registro de Actividades"
const editTitle = "Editando grupo existente"

@Component({
  selector: 'app-groups-admin',
  templateUrl: './groups-admin.component.html',
  styleUrls: ['./groups-admin.component.css']
})
export class GroupsAdminComponent implements OnInit {

  @ViewChild('adminSearch') adminSearch!: SearchFieldComponent

  registerForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
  })
  get formName(): string {
    return this.registerForm.controls['name'].value
  }

  group_list: GroupWithAdmin[] = []
  message: string = "";
  warnMessage: string = "";
  editing: boolean = false;
  current_group: GroupWithAdmin | null = null;
  formTitle: string = registerTitle

  constructor(private registerService: RegisterService, private searchService: SearchService, private authService: AuthService) { }

  ngOnInit(): void {
    this.refreshGroups()
  }

  refreshGroups() {
    this.searchService.searchGroupsPage('').subscribe((res: HttpResponse<number[]>) => {
      if (res.body) {
        this.group_list = []
        res.body.forEach((groupId: number, index: number) => {
          this.authService.getGroup(groupId).subscribe((groupResp: GroupResp | null) => {
            if (!!groupResp) {
              this.authService.getUser(groupResp.admin).subscribe(
                (user: User | null) => {
                  if (user)
                    this.group_list.splice(index, 0, { name: groupResp.name, admin: user, members: groupResp.members, id: groupId, adminId: groupResp.admin })
                }
              )
            }
          })
        })
      }
    }
    )
  }

  activateEditing(group: GroupWithAdmin) {
    this.formTitle = editTitle
    this.editing = true
    this.current_group = group

    this.registerService.resetForm(this.registerForm)
    this.registerForm.controls['name'].setValue(group.name)
    this.adminSearch.unselect()
  }

  cancelForm() {
    this.registerService.resetForm(this.registerForm)
    this.editing = false
    this.formTitle = registerTitle
    this.adminSearch.unselect()
    this.current_group = null

  }

  deleteGroupSubmit(id: number) {
    const userResponse = window.confirm('Seguro que desea eliminar el grupo?')
    if (userResponse) {
      this.registerService.delete_group(id).subscribe(res => {
        console.log("Grupo eliminado:", res)
        this.refreshGroups()
      })
    }
  }

  onSubmit() {
    this.warnMessage = ""
    this.message = ""

    if (this.checkFormValidity()) {
      if (this.editing) {

        this.registerService.edit_group(this.current_group!.id, { admin: this.current_group?.adminId || null, name: this.formName || null }).subscribe(
          (_: HttpResponse<null>) => {
            this.registerService.resetForm(this.registerForm)
            this.refreshGroups()
          },
          (err: HttpErrorResponse) => {
            if (err.status == 409) {
              this.message = "Nombre de grupo ya está tomado";
            }
          })

      }
      else { // registering new group
        this.registerService.register_group(this.formName, this.selectedAdmin!).subscribe(
          (resp: HttpResponse<Id>) => {
            if (resp.body) {
              this.registerService.resetForm(this.registerForm)
              this.message = "El grupo se ha registrado correctamente."
              window.location.reload()
            }
            else {
              this.warnMessage = "Lo sentimos, estamos experimentado problemas (falta de body en response).";
            }
          },
          (err: HttpErrorResponse) => {
            if (err.status == 400) {
              this.warnMessage = "Bad Request 400: Por favor verifique que los datos ingresados son válidos.";

            } else if (err.status == 409) {
              console.log("404:", err)
              this.warnMessage = "Conflict 409: Por favor escoja un nombre diferente para el grupo.";
            }
            else {
              this.warnMessage = "Lo sentimos, hubo un error registrando el reto."
            }
          }
        )
      }
    }
  }

  checkFormValidity(): boolean {
    this.warnMessage = ""

    if (!this.registerForm.valid || (this.editing === false && this.selectedAdmin === null)) {
      this.warnMessage = "Verifique que todos los campos fueron ingresados con formato correcto."
      return false
    }
    return true
  }

  selectedAdmin: number | null = null
  selectAdmin(event: { name: string, id: number }) {
    this.selectedAdmin = event.id
  }

  unselectAdmin() {
    this.selectedAdmin = null
  }

}
