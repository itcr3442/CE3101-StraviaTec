import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RoleLevels } from 'src/app/constants/user.constants';
import { User } from 'src/app/interfaces/user';
import { RegisterService } from 'src/app/services/register.service';


@Component({
  selector: 'app-register-user',
  templateUrl: './register-user.component.html',
  styleUrls: ['./register-user.component.css']
})
export class RegisterUserComponent implements OnInit {

  constructor(
    private registerService: RegisterService,
  ) {
  }

  ngOnInit(): void {
  }

  onSubmit(user: User) {
    console.log("Submitted user:", user)
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
}
