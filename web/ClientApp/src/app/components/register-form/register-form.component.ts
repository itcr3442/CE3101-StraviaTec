import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RoleLevels } from 'src/app/constants/user.constants';
import getUnicodeFlagIcon from 'country-flag-icons/unicode'
import { User } from 'src/app/interfaces/user'
import { Country } from 'src/app/interfaces/country'
import { Observable } from 'rxjs';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { RegisterService } from 'src/app/services/register.service'
import { Id } from "src/app/interfaces/id";

const countries = require("i18n-iso-countries");
countries.registerLocale(require("i18n-iso-countries/langs/es.json"));

@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.css']
})
export class RegisterFormComponent implements OnInit {
  registerForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    birthDate: new FormControl('', [Validators.required]),
    country: new FormControl('', [Validators.required])
  })

  maxDate: string;
  minDate: string = '1900-01-01'
  message: string = ""
  countryList: Country[];
  imageURL: string | null = null;

  @Input() userRole: RoleLevels = RoleLevels.Athlete;
  @Input() successMsg: string = "";

  constructor(private registerService: RegisterService
  ) {
    let countryObject = countries.getNames("es", { select: "official" })
    this.countryList = Object.entries(countryObject).map(([key, val]) => { return { alpha2: key, official: <string>val, flag: getUnicodeFlagIcon(key) } })

    let today = new Date()
    this.maxDate = (today.getFullYear() - 13) + "-" + (today.getMonth() + 1 + "").padStart(2, "0") + "-" + (today.getDate() + '').padStart(2, "0")
    console.log("Max Date:", this.maxDate)
  }

  ngOnInit(): void {
  }

  upload(files: FileList) {
    this.imageURL = URL.createObjectURL(files[0]);
    console.log("images:", files)
    console.log("image:", files[0])
    console.log("imageURL:", this.imageURL)
  }

  // Este get es para poder usarlo dentro de template
  public get RoleLevels(): typeof RoleLevels {
    return RoleLevels;
  }

  get username() {
    return this.registerForm.controls['username'].value
  }

  get password() {
    return this.registerForm.controls['password'].value
  }

  get firstName() {
    return this.registerForm.controls['firstName'].value
  }
  get lastName() {
    return this.registerForm.controls['lastName'].value
  }
  get country() {
    return this.registerForm.controls['country'].value
  }
  get birthDate() {
    return this.registerForm.controls['birthDate'].value
  }

  validateForm(): boolean {
    //validate date
    if (!this.registerForm.valid) {
      this.message = "Por favor verifique que ingresó todos los campos correctamente";
      return false
    }
    if (this.birthDate > this.maxDate || this.birthDate < this.minDate) {
      this.message = "Por favor introduzca una fecha de nacimiento válida. Solo se permiten usuarios mayores de 13 años."
      return false
    }
    return true
  }


  onSubmit() {
    if (this.validateForm()) {
      this.message = ""
      let user: User = {
        username: this.username,
        firstName: this.firstName,
        lastName: this.lastName,
        birthDate: new Date(this.birthDate),
        country: this.country,
        password: this.password,
        imageURL: this.imageURL,
        type: this.userRole,
      }

      console.log("User submitted:", user)


      this.registerService.register_user(user).subscribe(
        (resp: HttpResponse<Id>) => {
          console.log(resp)
          this.registerService.resetForm(this.registerForm)
          this.message = this.successMsg;
          if (this.imageURL != null) {
            //TODO: submit image to server
            URL.revokeObjectURL(this.imageURL)
          }
        },
        (err: HttpErrorResponse) => {
          if (err.status == 409) {
            this.message = "Nombre de usuario ya está tomado.";
          } else if (err.status == 400) {
            this.message = "Bad Request 400: Por favor verifique que los datos ingresados son válidos.";

          } else if (err.status == 404) {
            console.log("404:", err)
            this.message = "Not Found 404: Estamos experimentando problemas, vuelva a intentar más tarde.";

          }
        })
    }
  }
}