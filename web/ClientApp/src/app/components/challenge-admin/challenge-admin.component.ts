import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { AfterViewChecked, Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivityType, ActivityTypeType } from 'src/app/constants/activity.constants';
import { Challenge, NullableChallenge } from 'src/app/interfaces/challenge';
import { Id } from 'src/app/interfaces/id';
import { AuthService } from 'src/app/services/auth.service';
import { FormattingService } from 'src/app/services/formatting.service';
import { RegisterService } from 'src/app/services/register.service';
import { SearchService } from 'src/app/services/search.service';
import { SearchFieldComponent } from '../search-field/search-field.component';

const registerTitle = "Registro de Retos"
const editTitle = "Editando reto existente"

@Component({
  selector: 'app-challenge-admin',
  templateUrl: './challenge-admin.component.html',
  styleUrls: ['./challenge-admin.component.css']
})
export class ChallengeAdminComponent implements OnInit, AfterViewChecked {

  @ViewChildren('searchField') fieldsList!: QueryList<SearchFieldComponent>

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
  get formStart(): string {
    return this.registerForm.controls['startDate'].value
  }
  get formEnd(): string {
    return this.registerForm.controls['endDate'].value
  }
  get formActivity(): string {
    return this.registerForm.controls['activityType'].value
  }
  get formKm(): string {
    return this.registerForm.controls['kilometers'].value
  }
  get isPrivate(): boolean {
    return this.registerForm.controls['isPrivate'].value
  }

  constructor(private registerService: RegisterService, private searchService: SearchService, private authService: AuthService, private formatter: FormattingService) {
    let today = new Date()
    this.minDate = this.formatter.toDateStr(new Date(today.getFullYear(), today.getMonth(), today.getDate(), 24, 0, 0))
    this.maxDate = this.formatter.toDateStr(new Date(today.getFullYear() + 5, today.getMonth(), today.getDate() + 12, 0, 0, 0))
    for (let a in ActivityType) {
      if (typeof ActivityType[a] === 'number') this.activityTypes.push(a as (keyof typeof ActivityType));
    }
  }

  ngOnInit(): void {
    this.refreshChallenges()
  }

  datesValidity(): boolean {
    let startDateCtrl = this.registerForm.controls['startDate']
    let endDateCtrl = this.registerForm.controls['endDate']
    let startDate = new Date(startDateCtrl.value)
    startDate.setSeconds(1)
    let endDate = new Date(endDateCtrl.value)
    endDate.setHours(23)
    return startDateCtrl.valid && endDateCtrl.valid && startDate > new Date(this.minDate) && endDate < new Date(this.maxDate) && startDate <= endDate
  }

  checkGroupsValidity(): boolean {
    let groupsList: Array<number> = []
    for (let i = 0; i < this.selectedGroups.length; i++) {

      let selectedGroup = this.selectedGroups[i]

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
      let endDate = new Date(this.formEnd)
      if (this.editing) {
        let edit_challenge: NullableChallenge = {
          name: this.formName || null,
          start: !this.formStart ? null : (new Date(this.formStart)).toISOString(),
          end: !this.formEnd ? null : (new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59)).toISOString(),
          type: this.formActivity as ActivityTypeType || null,
          goal: +this.formKm || null,
          privateGroups: this.isPrivate ? this.selectedGroups.filter((g: number) => { return g !== -1 }) : [],
        }

        this.registerService.edit_challenge(this.current_challenge!, edit_challenge).subscribe(
          (_: HttpResponse<null>) => {
            this.registerService.resetForm(this.registerForm)
            this.refreshChallenges()
          },
          (err: HttpErrorResponse) => {
            if (err.status == 409) {
              this.message = "Nombre de reto ya está tomado";
            }
          })

      }
      else { // registering new group
        let challenge: Challenge = {
          name: this.formName,
          start: new Date(this.formStart),
          end: new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59),
          type: +this.formActivity,
          goal: +this.formKm,
          progress: 0,
          remainingDays: 0,
          privateGroups: this.isPrivate ? this.selectedGroups.filter((g: number) => { return g !== -1 }) : [],
          status: 0
        }

        this.registerService.register_challenge(challenge).subscribe(
          (postResp: HttpResponse<Id>) => {
            if (postResp.body) {
              this.registerService.resetForm(this.registerForm)
              this.message = "El reto se ha registrado correctamente."
              this.refreshChallenges()
              // window.location.reload()
            }
            else {
              this.warnMessage = "Lo sentimos, estamos experimentado problemas (falta de body en response).";
            }

          },
          (err: HttpErrorResponse) => {
            if (err.status == 400) {
              this.warnMessage = "Bad Request 400: Por favor verifique que los datos ingresados son válidos.";

            } else if (err.status == 404) {
              console.log("404:", err)
              this.warnMessage = "Not Found 404: Estamos experimentando problemas, vuelva a intentar más tarde.";
            }
            else {
              this.warnMessage = "Lo sentimos, hubo un error registrando el reto."
            }
          }
        )
      }
    }
  }

  selectedGroups: number[] = [];
  totalGroups: number = 1

  groupCounter() {
    return new Array(this.totalGroups);
  }

  addgroup() {
    this.selectedGroups.push(-1)
    this.totalGroups += 1
  }

  decreaseGroup() {
    this.selectedGroups.pop()
    this.totalGroups -= 1
  }

  selectGroup(event: { name: string, id: number }, index: number) {
    this.selectedGroups[index] = event.id
  }

  unselectGroup(index: number) {
    this.selectedGroups.splice(index, 1, -1)
  }

  formTitle: string = registerTitle;
  challenge_list: { c: Challenge, id: number }[] = []
  current_challenge: number | null = null
  editing: boolean = false
  editingSetup: boolean = false

  activateEditing(challengeId: number, challenge: Challenge) {
    this.formTitle = editTitle
    this.editing = true
    this.editingSetup = true
    this.current_challenge = challengeId

    this.registerService.resetForm(this.registerForm)

    this.registerForm.controls['name'].setValue(challenge.name)
    this.registerForm.controls['startDate'].setValue(this.formatter.toDateStr(challenge.start))
    this.registerForm.controls['endDate'].setValue(this.formatter.toDateStr(challenge.end))
    this.registerForm.controls['activityType'].setValue(challenge.type)
    this.registerForm.controls['kilometers'].setValue(challenge.goal)
    this.registerForm.controls['isPrivate'].setValue(challenge.privateGroups.length > 0)
    this.selectedGroups = challenge.privateGroups
    this.totalGroups = this.selectedGroups.length || 1
  }

  // ngDoChe
  ngAfterViewChecked() {
    // console.log("fieldsList:", this.fieldsList.length)
    if (this.editingSetup) {
      this.fieldsList.forEach((searchField: SearchFieldComponent, i: number) => { searchField.setValue(this.selectedGroups[i]) });
      this.editingSetup = false
    }
  }

  cancelForm() {
    this.registerService.resetForm(this.registerForm)
    this.editing = false
    this.formTitle = registerTitle
    this.current_challenge = null
    this.selectedGroups = []
  }

  deleteChallengeSubmit(id: number) {
    const userResponse = window.confirm('Seguro que desea eliminar el reto?')
    if (userResponse) {
      this.registerService.delete_challenge(id).subscribe(res => {
        console.log("Reto eliminado:", res)
        this.refreshChallenges()
      })
    }
  }

  refreshChallenges() {
    this.searchService.searchChallengesPage('').subscribe((res: HttpResponse<number[]>) => {
      if (res.body) {
        this.challenge_list = []
        res.body.forEach((challengeId: number, index: number) => {
          this.authService.getChallenge(challengeId).subscribe((challengeResp: Challenge | null) => {
            if (!!challengeResp) {
              this.challenge_list.splice(index, 0, { c: challengeResp, id: challengeId })
            }
          })
        })
      }
    }
    )
  }

}
