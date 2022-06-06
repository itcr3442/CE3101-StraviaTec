import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivityType } from 'src/app/constants/activity.constants';
import { FormattingService } from 'src/app/services/formatting.service';
import { RegisterService } from 'src/app/services/register.service';

@Component({
  selector: 'app-challenge-admin',
  templateUrl: './challenge-admin.component.html',
  styleUrls: ['./challenge-admin.component.css']
})
export class ChallengeAdminComponent implements OnInit {
  registerForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    startDate: new FormControl('', [Validators.required]),
    endDate: new FormControl('', [Validators.required]),
    activityType: new FormControl('', [Validators.required]),
    kilometers: new FormControl('', [Validators.required, Validators.pattern('[0-9]*\.?[0-9]+')]),
    isPrivate: new FormControl(false, [Validators.required]),
  })

  message: string = "";
  warnMessage: string = "";
  maxDate: string;
  minDate: string;

  activityTypes: (keyof typeof ActivityType)[] = [];
  // Para acceder el enum dentro de html
  get activityTypeEnum(): typeof ActivityType {
    return ActivityType
  }
  get formName(): string {
    return this.registerForm.controls['name'].value
  }
  get isPrivate(): boolean {
    return this.registerForm.controls['isPrivate'].value
  }

  constructor(private registerService: RegisterService, private formatter: FormattingService) {
    let today = new Date()
    this.minDate = this.formatter.toDateStr(today)
    this.maxDate = this.formatter.toDateStr(new Date(today.getFullYear() + 5, today.getMonth(), today.getDate(), 0, 0, 0))
    for (let a in ActivityType) {
      if (typeof ActivityType[a] === 'number') this.activityTypes.push(a as (keyof typeof ActivityType));
    }
  }

  ngOnInit(): void {
  }

  datesValidity(): boolean {
    let startDateCtrl = this.registerForm.controls['startDate']
    let endDateCtrl = this.registerForm.controls['endDate']
    let startDate = new Date(startDateCtrl.value)
    let endDate = new Date(endDateCtrl.value)
    return startDateCtrl.valid && endDateCtrl.valid && startDate > new Date(this.minDate) && endDate < new Date(this.maxDate) && startDate <= endDate
  }

  checkGroupsValidity(): boolean {
    let groupsList: Array<number> = []
    for (let i = 0; i < this.selectedGroups.length; i++) {

      let selectedGroup = this.selectedGroups[i]

      // console.log("groups list:", groupsList)
      // console.log("selected group:", selectedGroup)

      if (selectedGroup === -1) {
        continue
      }

      if (groupsList.includes(selectedGroup)) {
        console.log("Repeat group:", selectedGroup)
        this.warnMessage = "No se pueden tener grupos repetidos."
        return false
      }
      groupsList.push(selectedGroup)
    }
    console.log("groupsList:", groupsList)
    console.log("privacy:", this.isPrivate)
    if (groupsList.length === 0 && this.isPrivate) {
      this.warnMessage = "Si desea que el evento sea privado debe seleccionar por lo menos un grupo."
      return false
    }
    return true
  }

  checkFormValidity(): boolean {
    this.warnMessage = ""

    if (!this.registerForm.valid) {
      this.warnMessage = "Verifique que todos los campos fueron ingresados con formato correcto."
      return false
    }
    if (!this.datesValidity()) {
      this.warnMessage = "Por favor ingrese fechas válidas y verifique que la fecha de inicio sea antes que la fecha de fin."
      return false
    }
    if (!this.checkGroupsValidity()) {
      return false
    }
    return true
  }

  onSubmit() {
    this.warnMessage = ""
    this.message = ""

    if (this.checkFormValidity()) {
      this.message = "yay!!"
    }
  }

  selectedGroups: number[] = [];
  get totalGroups(): number {
    return this.selectedGroups.length + 1
  }

  groupCounter() {
    return new Array(this.totalGroups);
  }

  addgroup() {
    this.selectedGroups.push(-1)
  }

  decreaseGroup() {
    this.selectedGroups.pop()
  }

  selectGroup(event: { name: string, id: number }, index: number) {
    this.selectedGroups[index] = event.id
  }

  unselectGroup(index: number) {
    this.selectedGroups[index] = -1
  }

}
