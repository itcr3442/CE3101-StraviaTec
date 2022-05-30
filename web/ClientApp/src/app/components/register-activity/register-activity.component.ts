import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { ActivityType } from 'src/app/constants/activity.constants';

@Component({
  selector: 'app-register-activity',
  templateUrl: './register-activity.component.html',
  styleUrls: ['./register-activity.component.css']
})
export class RegisterActivityComponent implements OnInit {

  registerForm = new FormGroup({
    startDate: new FormControl('', [Validators.required]),
    minutes: new FormControl('', [Validators.required, Validators.pattern('[0-9]*\.?[0-9]+')]),
    hours: new FormControl('', [Validators.required, Validators.pattern('[0-9]*\.?[0-9]+')]),
    activityType: new FormControl('', [Validators.required]),
    kilometers: new FormControl('', [Validators.required, Validators.pattern('[0-9]*\.?[0-9]+')]),
  })

  get activityTypeEnum(): typeof ActivityType {
    return ActivityType
  }

  activityTypes: (keyof typeof ActivityType)[] = [];

  startDateControl = new FormControl(null);
  endDateControl = new FormControl(null);
  message: string = "";
  maxDate: string;
  minDate: string = '1900-01-01'
  gpxURL: string | null = null;

  constructor() {
    let today = new Date()
    this.maxDate = today.getFullYear() + "-" + (today.getMonth() + 1 + "").padStart(2, "0") + "-" + (today.getDate() + '').padStart(2, "0")

    for (let a in ActivityType) {
      if (typeof ActivityType[a] === 'number') this.activityTypes.push(a as (keyof typeof ActivityType));
    }
  }

  ngOnInit(): void {
  }

  onSubmit() {
    this.message = ""

    if (this.registerForm.valid) {

      this.message = "yay!!"
    } else {
      this.message = "nay >:C"

    }
  }

  upload(files: FileList) {
    this.gpxURL = URL.createObjectURL(files[0]);
    console.log("gpxfiles:", files)
    console.log("gpx:", files[0])
    console.log("gpxURL:", this.gpxURL)
  }

}
