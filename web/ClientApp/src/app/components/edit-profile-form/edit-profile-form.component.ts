import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { countries, RoleLevels } from 'src/app/constants/user.constants';
import { Country } from 'src/app/interfaces/country';
import getUnicodeFlagIcon from 'country-flag-icons/unicode'
import { User } from 'src/app/interfaces/user';

@Component({
  selector: 'app-edit-profile-form',
  templateUrl: './edit-profile-form.component.html',
  styleUrls: ['./edit-profile-form.component.css']
})
export class EditProfileFormComponent implements OnInit {

  registerForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
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

  @Input() user: User | null = null;

  constructor(
  ) {
    let countryObject = countries.getNames("es", { select: "official" })
    this.countryList = Object.entries(countryObject).map(([key, val]) => { return { alpha2: key, official: <string>val, flag: getUnicodeFlagIcon(key) } })

    let today = new Date()
    this.maxDate = (today.getFullYear() - 13) + "-" + (today.getMonth() + 1 + "").padStart(2, "0") + "-" + (today.getDate() + '').padStart(2, "0")
  }

  ngOnInit(): void {
  }

  // upload(files: FileList) {
  //   this.imageURL = URL.createObjectURL(files[0]);
  //   console.log("images:", files)
  //   console.log("image:", files[0])
  //   console.log("imageURL:", this.imageURL)
  // }

  get username() {
    return this.registerForm.controls['username'].value
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

  // Esto es para adentro de html
  get userBirthString(): string {
    console.log("User passed down:", this.user)
    if (this.user) {
      console.log("So birthday is getting done")
      let userBirthDate: Date = this.user.birthDate;
      return userBirthDate.getFullYear() + "-" + (userBirthDate.getMonth() + 1 + "").padStart(2, "0") + "-" + (userBirthDate.getDate() + '').padStart(2, "0")
    }
    return ""
  }

}
