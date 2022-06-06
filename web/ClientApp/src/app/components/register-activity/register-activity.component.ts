import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { ApplicationRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivityType } from 'src/app/constants/activity.constants';
import { latLng, Layer, tileLayer, Map as LeafMap, LayerEvent } from 'leaflet';
import * as L from 'leaflet-gpx';
import { gpxType, RegisterService } from 'src/app/services/register.service';
import { Activity } from 'src/app/interfaces/activity';
import { Id } from 'src/app/interfaces/id';
import { FormattingService } from 'src/app/services/formatting.service';
import { AuthService } from 'src/app/services/auth.service';
import { Race } from 'src/app/interfaces/race';
import { Challenge } from 'src/app/interfaces/challenge';

enum PertainsTo {
  Not,
  Challenge,
  Race
}


@Component({
  selector: 'app-register-activity',
  templateUrl: './register-activity.component.html',
  styleUrls: ['./register-activity.component.css']
})
export class RegisterActivityComponent implements OnInit {

  // opciones para mapa inicial, no editar
  options = {
    layers: [
      tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '...' })
    ],
    zoom: 15,
    center: latLng(9.855319, -83.910799)
  };

  registerForm = new FormGroup({
    startDate: new FormControl('', [Validators.required]),
    endDate: new FormControl('', [Validators.required]),
    activityType: new FormControl('', [Validators.required]),
    kilometers: new FormControl('', [Validators.required, Validators.pattern('[0-9]*\.?[0-9]+')]),
  })

  message: string = "";
  warnMessage: string = "";
  maxDate: string;
  minDate: string = this.formatter.toLocalTimeStr(new Date('1900'))

  // Referencia al mapa
  gpxMapReference: LeafMap | null = null

  // Archivo gpx
  gpxURL: string | null = null;
  // layers del mapa, se usa solo para meter el layer del gpx
  gpxLayer: Layer[] = [];
  // el file mismo
  gpxFile: File | null = null

  activityTypes: (keyof typeof ActivityType)[] = [];
  // Para acceder el enum dentro de html
  get activityTypeEnum(): typeof ActivityType {
    return ActivityType
  }

  partOf: PertainsTo = PertainsTo.Not;
  get PertainsTo(): typeof PertainsTo {
    return PertainsTo
  }

  constructor(private registerService: RegisterService, private authService: AuthService, private formatter: FormattingService) {
    let today = new Date()
    this.maxDate = this.formatter.toLocalTimeStr(today)
    for (let a in ActivityType) {
      if (typeof ActivityType[a] === 'number') this.activityTypes.push(a as (keyof typeof ActivityType));
    }
  }

  ngOnInit(): void {
  }

  onMapReady(map: LeafMap) {
    this.gpxMapReference = map
  }

  updateDuration(): void {
    let startDateCtrl = this.registerForm.controls['startDate']
    let endDateCtrl = this.registerForm.controls['endDate']

    if (this.datesValidity()) {
      let startDate = new Date(startDateCtrl.value)
      let endDate = new Date(endDateCtrl.value)
      var durationInputValue = this.formatter.format_ms(endDate.getTime() - startDate.getTime());
    }
    else {
      var durationInputValue = "";
    }

    let durationInput = document.getElementById("durationField") as HTMLInputElement
    if (durationInput) {
      durationInput.value = durationInputValue
    }
  }

  datesValidity(): boolean {
    let startDateCtrl = this.registerForm.controls['startDate']
    let endDateCtrl = this.registerForm.controls['endDate']
    let startDate = new Date(startDateCtrl.value)
    let endDate = new Date(endDateCtrl.value)
    return startDateCtrl.valid && endDateCtrl.valid && startDate > new Date(this.minDate) && endDate < new Date(this.maxDate) && startDate < endDate
  }

  checkFormValidity(): boolean {
    this.warnMessage = ""

    if (!this.registerForm.valid) {
      this.warnMessage = "Verifique que todos los campos fueron ingresados con formato correcto."
    }
    if (!this.datesValidity()) {
      this.warnMessage = "Por favor ingrese fechas válidas y verifique que la fecha de inicio sea antes que la fecha de fin."
      return false
    }
    if (!((this.gpxFile !== null))) {
      this.warnMessage = "Por favor ingrese un archivo '.gpx' válido."
      return false
    }
    if (this.partOf !== PertainsTo.Not && this.selectedEvent === null) {
      this.warnMessage = "Por favor escoja al reto/carrera al que pertenece esta actividad."
      return false
    }
    return true
  }

  deleteActivity(id: number) {
    this.registerService.delete_activity(id).subscribe((deleteResp: HttpResponse<null>) => {
      console.log("delete resp:", deleteResp),
        (err: HttpErrorResponse) => {
          console.log("Error deleting activity:", err)
        }
    })
  }

  onSubmit() {
    this.message = ""

    if (this.checkFormValidity()) {

      let activity: Activity = {
        user: 0,
        start: new Date(this.registerForm.controls['startDate'].value),
        end: new Date(this.registerForm.controls['endDate'].value),
        length: this.registerForm.controls['kilometers'].value,
        type: this.registerForm.controls['activityType'].value
      }

      // console.log("Activity submitted:", activity)

      this.registerService.register_activity(activity).subscribe(
        (postResp: HttpResponse<Id>) => {
          if (postResp.body) {
            console.log("Register Activity Resp:", postResp)
            this.registerService.resetForm(this.registerForm)
            this.message = "Su actividad se ha registrado correctamente."

            // put gpx track
            if (this.gpxFile !== null) {
              this.registerService.put_gpx(postResp.body.id, this.gpxFile, gpxType.Activity).subscribe(
                (gpxResp: HttpResponse<null>) => {
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

                  //Delete previously posted activity
                  if (postResp.body)
                    this.deleteActivity(postResp.body.id)

                }
              )
            }

            if (this.gpxURL !== null) {
              URL.revokeObjectURL(this.gpxURL)
            }

            // Add to race/challenge
            if (this.partOf !== PertainsTo.Not) {
              switch (this.partOf) {
                case PertainsTo.Challenge:
                  this.registerService.challenge_progress(this.selectedEvent!, postResp.body.id).subscribe(
                    (resp: HttpResponse<null>) => console.log("Activity part of challenge resp:", resp),
                    (err: HttpErrorResponse) => {
                      console.log("Error associating activity to challenge:", err)
                      this.warnMessage = "Hubo un error asociando la actividad al reto por lo que será borrada."
                      this.deleteActivity(postResp.body!.id)
                    }
                  )
                  break;
                case PertainsTo.Race:
                  this.registerService.race_progress(this.selectedEvent!, postResp.body.id).subscribe(
                    (resp: HttpResponse<null>) => console.log("Activity part of race resp:", resp),
                    (err: HttpErrorResponse) => {
                      console.log("Error associating activity to race:", err)
                      this.warnMessage = "Hubo un error asociando la actividad a la carrera por lo que será borrada."
                      this.deleteActivity(postResp.body!.id)
                    }
                  )
                  break;
              }
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
          }
        })

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
      let self = this

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
        let form = self.registerForm;

        if (e.target.get_total_time() > 0) {

          let startDateValue = self.formatter.toLocalTimeStr(e.target.get_start_time());
          console.log("Start date:", startDateValue)
          console.log("Start date month:", e.target.get_start_time().getMonth() + 1)

          form.controls['startDate'].setValue(startDateValue);
          form.controls['endDate'].setValue(self.formatter.toLocalTimeStr(e.target.get_end_time()));
          self.updateDuration()
        }
        form.controls['kilometers'].setValue((e.target.get_distance() / 1000).toFixed(3))
      })

      this.gpxLayer.push(layer)
    }
  }

  changePartOf(event: Event) {
    let selectElement = event.target as HTMLSelectElement
    this.partOf = +selectElement.value
    if (this.partOf === PertainsTo.Not) {
      this.registerForm.controls["activityType"].enable()
    } else {
      this.registerForm.controls["activityType"].disable()
    }
  }

  selectedEvent: number | null = null
  selectEvent(event: { name: string, id: number }, type: 'Race' | 'Challenge') {
    switch (type) {
      case 'Race':
        this.authService.getRace(event.id).subscribe(
          (resp: Race | null) => {
            if (resp) {
              this.registerForm.controls["activityType"].setValue(resp.type)
              this.selectedEvent = event.id
            }
          }
        )
        break
      case 'Challenge':
        this.authService.getChallenge(event.id).subscribe(
          (resp: Challenge | null) => {
            if (resp) {
              this.registerForm.controls["activityType"].setValue(resp.type)
              this.selectedEvent = event.id
            }
          }
        )
        break
    }
  }

  unselectEvent() {
    this.selectedEvent = null
  }

}
