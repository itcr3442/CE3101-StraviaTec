import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-reset-password-form',
  templateUrl: './reset-password-form.component.html',
  styleUrls: ['./reset-password-form.component.css']
})
export class ResetPasswordFormComponent implements OnInit {
  resetForm = new FormGroup({
    old: new FormControl('', [Validators.required]),
    new: new FormControl('', [Validators.required]),
  })

  message: string = ""

  constructor() { }

  get old(): string {
    return this.resetForm.controls['old'].value
  }
  get new(): string {
    return this.resetForm.controls['new'].value
  }

  ngOnInit(): void {
  }
  validateForm(): boolean {
    if (!this.resetForm.valid) {
      this.message = "Por favor verifique que ingresó todos los campos.";
      return false
    }
    return true
  }

}
