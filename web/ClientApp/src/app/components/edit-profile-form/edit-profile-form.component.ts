import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { countries, maxImageSize } from 'src/app/constants/user.constants';
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
  imageFile: File | null = null;

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

  ngOnChanges(): void {
    if (this.user !== null) {
      this.registerForm.controls['username'].setValue(this.user.username)
      this.registerForm.controls['firstName'].setValue(this.user.firstName)
      this.registerForm.controls['lastName'].setValue(this.user.lastName)
      this.registerForm.controls['country'].setValue(this.user.country.alpha2)
      this.registerForm.controls['birthDate'].setValue(this.userBirthString)
    }
  }

  get username(): string {
    return this.registerForm.controls['username'].value
  }

  get firstName(): string {
    return this.registerForm.controls['firstName'].value
  }
  get lastName(): string {
    return this.registerForm.controls['lastName'].value
  }
  get country(): string {
    return this.registerForm.controls['country'].value
  }
  get birthDate(): string {
    return this.registerForm.controls['birthDate'].value
  }

  upload(files: FileList) {
    this.imageFile = files[0];
    this.imageURL = URL.createObjectURL(this.imageFile);

    if (this.imageFile.size > maxImageSize) {
      this.clearImage()
      this.message = "Tamaño de imagen excedió límite de 4MB."
    }
  }

  clearImage() {
    console.log("Clearing")
    if (this.imageURL) URL.revokeObjectURL(this.imageURL)
    this.imageFile = null

    let fileInputEl: HTMLInputElement = document.getElementById('pfp') as HTMLInputElement
    fileInputEl.value = ''
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
    // console.log("User passed down:", this.user)
    if (this.user) {
      let userBirthDate: Date = this.user.birthDate;
      return userBirthDate.getFullYear() + "-" + (userBirthDate.getMonth() + 1 + "").padStart(2, "0") + "-" + (userBirthDate.getDate() + '').padStart(2, "0")
    }
    return ""
  }

}
