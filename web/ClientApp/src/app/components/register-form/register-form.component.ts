import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RoleLevels } from 'src/app/constants/user.constants';
import getUnicodeFlagIcon from 'country-flag-icons/unicode'
import { User } from 'src/app/interfaces/user'
import { Country } from 'src/app/interfaces/country'

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

  message: string = ""
  countryList: Country[];
  maxDate: string;
  imageURL: string | null = null;

  @Output() $formSubmit = new EventEmitter<User>();

  constructor(
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


  onSubmit() {
    if (this.registerForm.valid) {
      this.message = ""
      let arrivalTime: Date = new Date(this.birthDate)
      console.log(arrivalTime.toISOString())

      let user: User = {
        name: this.firstName,
        lastName: this.lastName,
        birthDate: new Date(this.birthDate),
        country: this.country,
        password: this.password,
        imageURL: this.imageURL,
      }

      this.$formSubmit.emit(user)

      // this.registerService.register_user(this.username, this.password, this.firstName, this.lastName, this.phone, this.email, this.isStudent, this.university, this.studentId).subscribe(
      //   (resp: any) => {
      //     this.message = "Felicitaciones! Se ha registrado correctamente";
      //     this.registerService.resetForm(this.registerForm)
      //   },
      //   err => {
      //     if (err.status == 409) {
      //       this.message = "Nombre de usuario ya está tomado";
      //     }
      //   })

    }
    else {
      this.message = "Por favor verifique que ingresó todos los campos correctamente";
    }
  }
}
