import { Component, OnInit, ViewChild } from '@angular/core';
import { RoleLevels } from 'src/app/constants/user.constants';
import { RegisterFormComponent } from '../register-form/register-form.component';

@Component({
  selector: 'app-register-org',
  templateUrl: './register-org.component.html',
  styleUrls: ['./register-org.component.css']
})
export class RegisterOrgComponent implements OnInit {
  @ViewChild(RegisterFormComponent) registerFormComponent: RegisterFormComponent = {} as RegisterFormComponent;

  RoleLevels = RoleLevels

  constructor(
  ) {
  }

  ngOnInit(): void {
  }

}
