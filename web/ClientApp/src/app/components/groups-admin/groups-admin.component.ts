import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Id } from 'src/app/interfaces/id';
import { RegisterService } from 'src/app/services/register.service';

@Component({
  selector: 'app-groups-admin',
  templateUrl: './groups-admin.component.html',
  styleUrls: ['./groups-admin.component.css']
})
export class GroupsAdminComponent implements OnInit {
  registerForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
  })
  get formName(): string {
    return this.registerForm.controls['name'].value
  }

  message: string = "";
  warnMessage: string = "";

  constructor(private registerService: RegisterService) { }

  ngOnInit(): void {
  }

  onSubmit() {
    this.warnMessage = ""
    this.message = ""

    if (this.checkFormValidity() && this.selectedAdmin) {
      this.registerService.register_group(this.formName, this.selectedAdmin).subscribe(
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

  checkFormValidity(): boolean {
    this.warnMessage = ""

    if (!this.registerForm.valid || this.selectedAdmin === null) {
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
