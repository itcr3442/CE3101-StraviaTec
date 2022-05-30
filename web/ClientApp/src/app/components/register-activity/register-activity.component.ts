import { HttpResponse} from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { RepositoryService } from 'src/app/services/repository.service';
import { NgxMatDatetimePicker } from '@angular-material-components/datetime-picker';

@Component({
  selector: 'app-register-activity',
  templateUrl: './register-activity.component.html',
  styleUrls: ['./register-activity.component.css']
})
export class RegisterActivityComponent implements OnInit {

  registerForm = new FormGroup({
    startDate: new FormControl('', [Validators.required]),
    endDate: new FormControl('', [Validators.required]),
    activityType: new FormControl('', [Validators.required]),
  })

  startDateControl = new FormControl(null);
  endDateControl = new FormControl(null);
  message: string = "";
  maxDate: string;
  minDate: string = '1900-01-01'
  gpxURL: string | null = null;

  constructor() { 
    let today = new Date()
    this.maxDate = (today.getFullYear() - 13) + "-" + (today.getMonth() + 1 + "").padStart(2, "0") + "-" + (today.getDate() + '').padStart(2, "0")
  }

  ngOnInit(): void {
  }

  onSubmit() {
    if (this.registerForm.valid) {


    }else{

    }
  }

  upload(files: FileList) {
    this.gpxURL = URL.createObjectURL(files[0]);
    console.log("gpxfiles:", files)
    console.log("gpx:", files[0])
    console.log("gpxURL:", this.gpxURL)
  }

}
