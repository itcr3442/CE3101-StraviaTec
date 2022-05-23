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
    this.registerFormComponent.handleResponse(this.registerService.resetForm, this.registerService.register_user(user), "Felicidades! Se ha registrado correctamente.")

  }
}
