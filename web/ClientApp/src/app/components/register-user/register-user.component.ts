import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RoleLevels } from 'src/app/constants/user.constants';
import { User } from 'src/app/interfaces/user';
import { RegisterService } from 'src/app/services/register.service';
import { RegisterFormComponent } from '../register-form/register-form.component';


@Component({
  selector: 'app-register-user',
  templateUrl: './register-user.component.html',
  styleUrls: ['./register-user.component.css']
})
export class RegisterUserComponent implements OnInit {

  @ViewChild(RegisterFormComponent) registerFormComponent: RegisterFormComponent = {} as RegisterFormComponent;

  athlete = RoleLevels.Athlete;

  constructor(
    private registerService: RegisterService,
  ) {
  }

  ngOnInit(): void {
  }

  onSubmit(user: User) {

    console.log("Submitted user:", user)
    this.registerService.register_user(user).subscribe(
      (resp: any) => {
        console.log(resp)
        this.registerService.resetForm(this.registerFormComponent.registerForm)
        this.registerFormComponent.message = "Felicidades! Se ha registrado correctamente";
        if (this.registerFormComponent.imageURL != null) {
          URL.revokeObjectURL(this.registerFormComponent.imageURL)
        }
      },
      err => {
        if (err.status == 409) {
          this.registerFormComponent.message = "Nombre de usuario ya está tomado";
        } else if (err.status == 400) {
          this.registerFormComponent.message = "Bad Request 400";

        } else if (err.status == 404) {
          console.log("404:", err)
        }
      })

  }
}
