import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { ApplicationRef, Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivityType, ActivityTypeType } from 'src/app/constants/activity.constants';
import { latLng, Layer, tileLayer, Map as LeafMap, LayerEvent } from 'leaflet';
import * as L from 'leaflet-gpx';
import { gpxType, RegisterService } from 'src/app/services/register.service';
import { Activity } from 'src/app/interfaces/activity';
import { Id } from 'src/app/interfaces/id';
import { NullableRace, Race } from 'src/app/interfaces/race';
import { RaceCategory, RaceCategoryType, RaceStatus } from 'src/app/constants/races.constants';
import { SearchFieldComponent } from '../search-field/search-field.component';
import { FormattingService } from 'src/app/services/formatting.service';
import { SearchService } from 'src/app/services/search.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-race-admin',
  templateUrl: './race-admin.component.html',
  styleUrls: ['./race-admin.component.css']
})
export class RaceAdminComponent implements OnInit {


  // opciones para mapa inicial, no editar
  options = {
    layers: [
      tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '...' })
    ],
    zoom: 15,
    center: latLng(9.855319, -83.910799)
  };

  registerForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    day: new FormControl('', [Validators.required]),
    activityType: new FormControl('', [Validators.required]),
    isPrivate: new FormControl(false, [Validators.required]),
    price: new FormControl('', [Validators.required, Validators.pattern('[0-9]*\.?[0-9]+')])
  })

  get formName(): string {
    return this.registerForm.controls['name'].value
  } get formDay(): string {
    return this.registerForm.controls['day'].value
  } get formActivityType(): string {
    return this.registerForm.controls['activityType'].value
  } get formPrivate(): boolean {
    return this.registerForm.controls['private'].value
  } get formPrice(): string {
    return this.registerForm.controls['price'].value
  } get isPrivate(): boolean {
    return this.registerForm.controls['isPrivate'].value
  }

  message: string = "";
  warnMessage: string = "";
  maxDate: string;
  minDate: string;

  // Referencia al mapa
  gpxMapReference: LeafMap | null = null

  // Archivo gpx
  gpxURL: string | null = null;
  // layers del mapa, se usa solo para meter el layer del gpx
  gpxLayer: Layer[] = [];
  // el file mismo
  gpxFile: File | null = null

  totalBanks: number = 1
  totalCategories: number = 1
  get selectedCategories(): RaceCategory[] {
    let categoryList: Array<RaceCategory> = []
    for (let i = 0; i < this.totalCategories; i++) {

      let categorySelect: HTMLSelectElement = document.getElementById('category-' + i) as HTMLSelectElement;
      let selectedCategory: number = +categorySelect.options[categorySelect.selectedIndex].value;

      categoryList.push(selectedCategory)
    }
    return categoryList
  }

  setCategories(list: RaceCategory[]): void {

    for (let i = 0; i < this.totalCategories; i++) {

      let categorySelect: HTMLSelectElement = document.getElementById('category-' + i) as HTMLSelectElement;
      categorySelect.selectedIndex = list[i]
    }
  }

  setBanks(list: string[]): void {

    for (let i = 0; i < this.totalBanks; i++) {

      let bankInput: HTMLInputElement = document.getElementById('iban-' + i) as HTMLInputElement;
      bankInput.value = list[i]
    }
  }


  get bankAccounts(): string[] {
    let bankList: Array<string> = []
    for (let i = 0; i < this.totalBanks; i++) {

      let bankInput: HTMLInputElement = document.getElementById('iban-' + i) as HTMLInputElement;
      let iban: string = bankInput.value;

      bankList.push(iban)
    }
    return bankList
  }


  activityTypes: (keyof typeof ActivityType)[] = [];
  // Para acceder el enum dentro de html
  get activityTypeEnum(): typeof ActivityType {
    return ActivityType
  }

  categoryTypes: (keyof typeof RaceCategory)[] = [];
  // Para acceder el enum dentro de html
  get raceCategoryEnum(): typeof RaceCategory {
    return RaceCategory
  }

  constructor(private registerService: RegisterService, private authService: AuthService, private formatter: FormattingService, private searchService: SearchService, private appRef: ApplicationRef) {
    let today = new Date()
    this.minDate = this.formatter.toDateStr(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 0, 0, 0))
    this.maxDate = this.formatter.toDateStr(new Date(today.getFullYear() + 5, today.getMonth(), today.getDate() + 1, 0, 0, 0))

    for (let a in ActivityType) {
      if (typeof ActivityType[a] === 'number') this.activityTypes.push(a as (keyof typeof ActivityType));
    }
    for (let c in RaceCategory) {
      if (typeof RaceCategory[c] === 'number') this.categoryTypes.push(c as (keyof typeof RaceCategory));
    }
  }

  ngOnInit(): void {
    this.refreshRaces()
  }

  onMapReady(map: LeafMap) {
    this.gpxMapReference = map
  }

  checkBanksValidity(): boolean {
    for (let i = 0; i < this.totalBanks; i++) {
      let bankInput: HTMLInputElement = document.getElementById('iban-' + i) as HTMLInputElement;
      let bankString: string = bankInput.value;

      const iban_regex: RegExp = /[A-Z]{2}\d{20}/;

      if (!iban_regex.test(bankString)) {
        console.log("IBAN # malformatted:", bankString)
        return false
      }
    }
    return true
  }

  checkCategoriesValidity(): boolean {
    let categoryList: Array<number> = []
    for (let i = 0; i < this.totalCategories; i++) {

      let categorySelect: HTMLSelectElement = document.getElementById('category-' + i) as HTMLSelectElement;
      let selectedCategory: number = +categorySelect.options[categorySelect.selectedIndex].value;
      // console.log("categories list:", categoryList)
      // console.log("selected category:", selectedCategory)

      if (categoryList.includes(selectedCategory)) {
        console.log("Repeat category:", selectedCategory)
        return false
      }
      categoryList.push(selectedCategory)
    }
    return true
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
    if (groupsList.length === 0 && this.isPrivate) {
      this.warnMessage = "Si desea que el evento sea privado debe seleccionar por lo menos un grupo."
      return false
    }
    return true
  }

  checkSponsorsValidity(): boolean {
    let sponsorsList: Array<number> = []
    for (let i = 0; i < this.selectedSponsors.length; i++) {

      let selectedSponsor = this.selectedSponsors[i]

      if (selectedSponsor === -1) {
        continue
      }

      if (sponsorsList.includes(selectedSponsor)) {
        console.log("Repeat sponsor:", selectedSponsor)
        this.warnMessage = "No se pueden tener grupos repetidos."
        return false
      }
      sponsorsList.push(selectedSponsor)
    }
    if (sponsorsList.length === 0) {
      this.warnMessage = "Seleccione al menos un patrocinador."
      return false
    }
    return true
  }

  checkFormValidity(): boolean {
    this.warnMessage = ""

    if (!this.registerForm.valid) {
      this.warnMessage = "Verifique que todos los campos fueron ingresados con formato correcto."
    }
    let raceDateCtrl = this.registerForm.controls['day']
    if (!(raceDateCtrl.valid && new Date(raceDateCtrl.value) > new Date(this.minDate))) {
      this.warnMessage = "Por favor ingrese una fecha válida."
      return false
    }
    if (!((this.gpxFile !== null) && (this.gpxFile.type === 'application/gpx+xml')) && this.editing === false) {
      this.warnMessage = "Por favor ingrese un archivo '.gpx' válido."
      return false
    }
    if (!this.checkCategoriesValidity()) {
      this.warnMessage = "No se pueden tener categorías repetidas."
      return false
    }
    if (!this.checkGroupsValidity()) {
      return false
    }
    if (!this.checkSponsorsValidity()) {
      return false
    }
    if (!this.checkBanksValidity()) {
      this.warnMessage = "Revise que los códigos IBAN ingresados sean todos válidos."
      return false
    }
    return true
  }

  onSubmit() {
    this.message = ""
    this.warnMessage = ""

    if (this.checkFormValidity()) {
      let sponsors = this.selectedSponsors.filter((g: number) => { return g !== -1 })

      if (this.editing) {
        let edit_race: NullableRace = {
          name: this.formName || null,
          day: !this.formDay ? null : new Date(this.formDay),
          type: !this.formActivityType ? null : +this.formActivityType,
          privateGroups: this.isPrivate ? this.selectedGroups.filter((g: number) => { return g !== -1 }) : [],
          categories: this.selectedCategories.length > 0 ? this.selectedCategories.map((category: RaceCategory) => RaceCategory[category] as RaceCategoryType) : null,
          price: !this.formPrice ? null : +this.formPrice,
          bankAccounts: this.bankAccounts.length > 0 ? this.bankAccounts : null,
          sponsors: sponsors.length > 0 ? sponsors : null,
        }

        this.registerService.edit_race(this.current_race!, edit_race).subscribe(
          (_: HttpResponse<null>) => {
            this.cancelForm()
            this.refreshRaces()
          },
          (err: HttpErrorResponse) => {
            if (err.status == 409) {
              this.message = "Nombre de reto ya está tomado";
            }
          })

      }
      else { // registering new group
        let race: Race = {
          name: this.formName,
          day: (new Date(this.formDay)),
          type: +this.formActivityType,
          privateGroups: this.isPrivate ? this.selectedGroups.filter((g: number) => { return g !== -1 }) : [],
          price: +this.formPrice,
          status: RaceStatus.NotRegistered, // field doesn't matter
          categories: this.selectedCategories,
          sponsors,
          bankAccounts: this.bankAccounts
        }

        console.log("Race submitted:", race)
        // return
        this.registerService.register_race(race).subscribe(
          (postResp: HttpResponse<Id>) => {
            if (postResp.body) {
              console.log("Register Race Resp:", postResp)
              this.registerService.resetForm(this.registerForm)
              this.message = "La carrera se ha registrado correctamente."

              // put gpx track
              if (this.gpxFile !== null) {
                this.registerService.put_gpx(postResp.body.id, this.gpxFile, gpxType.Race).subscribe(
                  (gpxResp: HttpResponse<null>) => {
                    window.location.reload()
                    console.log("PUT GPX resp:", gpxResp)
                  },
                  (err: HttpErrorResponse) => {
                    if (err.status == 400) {
                      this.warnMessage = "Hubo un problema con el formato del archivo '.gpx'."
                    }
                    else {
                      this.warnMessage = "Lo sentimos, hubo un problema a la hora de enviar el archivo '.gpx' al servidor."
                    }
                    console.log("Error while uploading gpx:", err);

                    //Delete previously posted race
                    if (postResp.body)
                      this.registerService.delete_race(postResp.body.id).subscribe((deleteResp: HttpResponse<null>) => {
                        console.log("delete resp:", deleteResp),
                          (err: HttpErrorResponse) => {
                            console.log("Error deleting race without gpx:", err)
                          }
                      })

                  }
                )
              }

              if (this.gpxURL !== null) {
                URL.revokeObjectURL(this.gpxURL)
              }
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
            } else {
              this.warnMessage = "Lo sentimos, hubo un error registrando la carrera."
            }
          })
      }
    }
  }

  upload(files: FileList) {
    if (this.gpxURL) {
      URL.revokeObjectURL(this.gpxURL)
    }

    this.gpxLayer = []

    this.gpxURL = URL.createObjectURL(files[0]);
    this.gpxFile = files[0]

    if (this.gpxMapReference) {
      let gpxMap = this.gpxMapReference;

      // @ts-ignore
      let layer = new L.GPX(this.gpxURL, {
        async: true,
        marker_options: {
          startIconUrl: 'assets/gpx-icons/pin-icon-start.png',
          endIconUrl: 'assets/gpx-icons/pin-icon-end.png',
          shadowUrl: 'assets/gpx-icons/pin-shadow.png'
        }
      }).on('loaded', function (e: LayerEvent) {
        gpxMap.fitBounds(e.target.getBounds());
      })

      this.gpxLayer.push(layer)
    }
  }

  bankCounter() {
    return new Array(this.totalBanks);
  }

  addBank() {
    this.totalBanks += 1
  }

  decreaseBank() {
    if (this.totalBanks === 1) return
    this.totalBanks -= 1
  }

  categoryCounter() {
    return new Array(this.totalCategories);
  }

  addCategory() {
    if (this.totalCategories === this.categoryTypes.length) return
    this.totalCategories += 1
  }

  decreaseCategory() {
    if (this.totalCategories === 1) return
    this.totalCategories -= 1
  }

  // onPrivacyChange(event: Event) {
  //   let target = event.target as HTMLInputElement

  //   this.isPrivate = target.checked
  //   console.log("Private:", this.isPrivate)
  // }

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

  selectedSponsors: number[] = [];
  totalSponsors: number = 1

  sponsorCounter() {
    return new Array(this.totalSponsors);
  }

  addSponsor() {
    this.selectedSponsors.push(-1)
    this.totalSponsors += 1
  }

  decreaseSponsor() {
    this.selectedSponsors.pop()
    this.totalSponsors -= 1
  }

  selectSponsor(event: { name: string, id: number }, index: number) {
    this.selectedSponsors[index] = event.id
  }

  unselectSponsor(index: number) {
    this.selectedSponsors.splice(index, 1, -1)
  }

  formTitle: string = registerTitle;
  race_list: { r: Race, id: number }[] = []
  current_race: number | null = null
  editing: boolean = false
  editingSetup: boolean = false

  activateEditing(raceId: number, race: Race) {
    this.formTitle = editTitle
    this.editing = true
    this.editingSetup = true
    this.current_race = raceId

    this.registerService.resetForm(this.registerForm)

    this.registerForm.controls['name'].setValue(race.name)
    this.registerForm.controls['day'].setValue(this.formatter.toDateStr(race.day))
    this.registerForm.controls['activityType'].setValue(race.type)
    this.registerForm.controls['isPrivate'].setValue(race.privateGroups.length > 0)
    this.registerForm.controls['price'].setValue(race.price)
    this.selectedGroups = race.privateGroups
    this.totalGroups = this.selectedGroups.length || 1
    this.selectedSponsors = race.sponsors;
    this.totalSponsors = this.selectedSponsors.length || 1

    this.totalBanks = race.bankAccounts.length || 1
    this.totalCategories = race.categories.length || 1

    this.appRef.tick()
    this.setCategories(race.categories)
    this.setBanks(race.bankAccounts)
  }

  @ViewChildren('groupSearchField') groupFieldsList!: QueryList<SearchFieldComponent>
  @ViewChildren('sponsorSearchField') sponsorFieldsList!: QueryList<SearchFieldComponent>

  ngAfterViewChecked() {
    // console.log("fieldsList:", this.fieldsList.length)
    if (this.editingSetup) {
      this.groupFieldsList.forEach((searchField: SearchFieldComponent, i: number) => { searchField.setValue(this.selectedGroups[i]) });
      this.sponsorFieldsList.forEach((searchField: SearchFieldComponent, i: number) => { !this.selectedSponsors[i] ? searchField.unselect() : searchField.setValue(this.selectedSponsors[i]) });
      this.editingSetup = false
    }
  }

  cancelForm() {
    this.registerService.resetForm(this.registerForm)
    this.editing = false
    this.formTitle = registerTitle
    this.current_race = null
    this.selectedGroups = []
    this.selectedSponsors = []
    this.totalGroups = 1
    this.totalSponsors = 1
    this.totalCategories = 1
    this.totalBanks = 1
    this.setCategories([0])
    this.setBanks([''])
    this.editingSetup = true
  }

  deleteRaceSubmit(id: number) {
    const userResponse = window.confirm('Seguro que desea eliminar la carrera?')
    if (userResponse) {
      this.cancelForm()
      this.registerService.delete_race(id).subscribe(res => {
        console.log("Carrera eliminada:", res)
        this.refreshRaces()
      })
    }
  }

  refreshRaces() {
    this.searchService.searchRacesPage('').subscribe((res: HttpResponse<number[]>) => {
      if (res.body) {
        this.race_list = []
        res.body.forEach((raceId: number, index: number) => {
          this.authService.getRace(raceId).subscribe((raceResp: Race | null) => {
            if (!!raceResp) {
              this.race_list.splice(index, 0, { r: raceResp, id: raceId })
            }
          })
        })
      }
    }
    )
  }
}

const registerTitle = "Registro de Carreras"
const editTitle = "Editando carrera existente"