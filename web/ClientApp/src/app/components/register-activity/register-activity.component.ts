import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivityType } from 'src/app/constants/activity.constants';
import { latLng, Layer, tileLayer, Map as LeafMap, LayerEvent } from 'leaflet';
import * as L from 'leaflet-gpx';
import { gpxType, RegisterService } from 'src/app/services/register.service';
import { Activity } from 'src/app/interfaces/activity';
import { Id } from 'src/app/interfaces/id';

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
  minDate: string = this.toLocalTimeStr(new Date('1900'))

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

  constructor(private registerService: RegisterService) {
    let today = new Date()
    this.maxDate = this.toLocalTimeStr(today)
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
      var durationInputValue = this.format_ms(endDate.getTime() - startDate.getTime());
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
    if (!((this.gpxFile !== null) && (this.gpxFile.type === 'application/gpx+xml'))) {
      this.warnMessage = "Por favor ingrese un archivo '.gpx' válido."
      return false
    }
    return true
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
                    this.registerService.delete_activity(postResp.body.id).subscribe((deleteResp: HttpResponse<null>) => {
                      console.log("delete resp:", deleteResp),
                        (err: HttpErrorResponse) => {
                          console.log("Error deleting activity without gpx:", err)
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

          let startDateValue = self.toLocalTimeStr(e.target.get_start_time());
          console.log("Start date:", startDateValue)
          console.log("Start date month:", e.target.get_start_time().getMonth() + 1)

          form.controls['startDate'].setValue(startDateValue);
          form.controls['endDate'].setValue(self.toLocalTimeStr(e.target.get_end_time()));
          self.updateDuration()
        }
        form.controls['kilometers'].setValue((e.target.get_distance() / 1000).toFixed(3))
      })

      this.gpxLayer.push(layer)
    }
  }

  toLocalTimeStr(date: Date) {
    return date.getFullYear() + "-" + padTwo(date.getMonth() + 1) + "-" + padTwo(date.getDate()) + "T" + padTwo(date.getHours()) + ":" + padTwo(date.getMinutes()) + ":" + padTwo(date.getSeconds()) //+ "." + padTwo(date.getMilliseconds())
  }

  format_ms(ms: number): string {
    let hours = ms / (1000 * 60 * 60)
    let mins = (hours % 1) * 60
    let secs = (mins % 1) * 60
    // let millis = Math.round((secs % 1) * 1000)
    return padTwo(Math.floor(hours)) + ':' + padTwo(Math.floor(mins)) + ':' + padTwo(Math.round(secs))// + '.' + ('' + Math.floor(millis)).padStart(3, "0")
  }

}

const padTwo = (n: number): string => {
  return (n + "").padStart(2, "0")
}