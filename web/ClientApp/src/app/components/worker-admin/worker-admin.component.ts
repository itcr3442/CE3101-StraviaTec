import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { RegisterService } from 'src/app/services/register.service';
import { User } from 'src/app/interfaces/user';
import { RoleLevels } from 'src/app/constants/auth.constants';

const registerTitle = "Registrar nuevo trabajador"
const editTitle = "Editando a funcionario existente"

@Component({
  selector: 'app-worker-admin',
  templateUrl: './worker-admin.component.html',
  styleUrls: ['./worker-admin.component.css']
})
export class WorkerAdminComponent implements OnInit {

  public worker_list!: User[];

  registerForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required]),
    phonenumber: new FormControl('', [Validators.required, Validators.pattern('[0-9]*')]),
  })
  message: string = ""
  editing: boolean
  current_user_id: string | null
  formTitle: string

  constructor(
    private router: Router,
    private authService: AuthService,
    private registerService: RegisterService,
  ) {
    this.formTitle = registerTitle
    this.editing = false
    this.current_user_id = null // usuario que se está editando, etc...

  }

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login/redirect']);
      return
    }
    this.refreshUsers()
  }

  refreshUsers() {
    this.registerService.getAllUsers().subscribe((res: any) => {
      console.log(res)
      let allUsers = res.body as User[]
      console.log("Users:", allUsers)
      let allWorkers = allUsers.filter((user) => { return user.type === RoleLevels.Admin })
      console.log("Get all workers res:", allWorkers);
      this.worker_list = allWorkers;
    }
    )
  }

  deleteUserSubmit(id: string) {
    const userResponse = window.confirm('Seguro que desea eliminar el usuario?')
    if (userResponse) {
      this.registerService.delete_user(id).subscribe(res => {
        console.log("Usuario eliminado:", res)
        this.refreshUsers()
      })
    }
  }

  activateEditing(id: string) {
    console.log("Editing activated!!")

    this.formTitle = editTitle
    this.editing = true
    this.current_user_id = id

    let passwordField = this.registerForm.get('password')

    passwordField?.setValidators(null);

    this.registerService.resetForm(this.registerForm)

    this.registerService.getUser(id).subscribe((user: any) => {
      let r_user = user.body as User
      console.log("Current user:", r_user)

      let any_user: any = r_user
      Object.entries(this.registerForm.controls).forEach(([key, control]) => control.setValue(any_user[key]))
    })

  }

  cancelForm() {
    this.registerService.resetForm(this.registerForm)
    this.editing = false
    this.formTitle = registerTitle
    let passwordField = this.registerForm.get('password')
    passwordField?.setValidators(Validators.required);
    this.current_user_id = null
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
    return this.registerForm.controls['phonenumber'].value
  }

  /**
   * Método que se ejecuta al apretar el botón registrar.
   * Verifica si el ususario ha iniciado sesión, para obtener los valores de las
   * casillas correspondientes y así registrar el nuevo trabajador en la base de datos del servidor
   */
  onSubmit() {

    if (this.registerForm.valid) {
      this.message = ""
      console.log("mik")

      if (this.editing) {
        console.log("edtandoouu")

        this.registerService.edit_user(this.current_user_id ?? "", this.username, this.password, this.firstName, this.lastName, this.phone, this.email, false, "", "").subscribe(
          (resp: any) => {
            this.registerService.resetForm(this.registerForm)
            this.refreshUsers()
          },
          err => {
            if (err.status == 409) {
              this.message = "Nombre de usuario ya está tomado";
            }
          })

      }
      else { // registering new user
        this.registerService.register_worker(this.username, this.password, this.firstName, this.lastName, this.phone, this.email).subscribe(
          (resp: any) => {
            this.registerService.resetForm(this.registerForm)
            this.refreshUsers()
          },
          err => {
            if (err.status == 409) {
              this.message = "Nombre de usuario ya está tomado";
            }
          })
      }


    }
    else {
      this.message = "Por favor verifique que ingresó todos los campos correctamente y su # de tel solo contiene dígitos";
    }


  }
}
