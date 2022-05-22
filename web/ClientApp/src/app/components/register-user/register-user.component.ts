import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RoleLevels } from 'src/app/constants/user.constants';
import { RegisterService } from 'src/app/services/register.service';

@Component({
  selector: 'app-register-user',
  templateUrl: './register-user.component.html',
  styleUrls: ['./register-user.component.css']
})
export class RegisterUserComponent implements OnInit {
  registerForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required]),
    phone: new FormControl('', [Validators.required, Validators.pattern('[0-9]*')]),
    isStudent: new FormControl(''),
    university: new FormControl(''),
    studentId: new FormControl('')
  })
  message: string = ""
  isStudent: boolean;

  constructor(
    private registerService: RegisterService,
  ) {
    this.isStudent = false
  }

  ngOnInit(): void {
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
  get email() {
    return this.registerForm.controls['email'].value
  }
  get phone() {
    return this.registerForm.controls['phone'].value
  }

  get university() {
    return this.registerForm.controls['university'].value
  }
  get studentId() {
    return this.registerForm.controls['studentId'].value
  }

  onStudentChange(event: Event) {
    let target = event.target as HTMLInputElement

    this.isStudent = target.checked

    let studentId = this.registerForm.get('studentId')
    let university = this.registerForm.get('university')

    if (this.isStudent) {
      studentId?.setValidators(Validators.required);
      university?.setValidators(Validators.required);

    }
    else {
      studentId?.setValidators(null);
      university?.setValidators(null);
    }

    studentId?.updateValueAndValidity();
    university?.updateValueAndValidity();
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.message = ""
      this.registerService.register_user(this.username, this.password, this.firstName, this.lastName, this.phone, this.email, this.isStudent, this.university, this.studentId).subscribe(
        (resp: any) => {
          this.message = "Felicitaciones! Se ha registrado correctamente";
          this.registerService.resetForm(this.registerForm)
        },
        err => {
          if (err.status == 409) {
            this.message = "Nombre de usuario ya está tomado";
          }
        })

    }
    else {
      this.message = "Por favor verifique que ingresó todos los campos correctamente y su # de tel solo contiene dígitos";
    }
  }
}
