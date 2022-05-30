import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { ActivityType } from 'src/app/constants/activity.constants';
import { circle, latLng, Layer, tileLayer, map as leafMap, Map as LeafMap, LayerEvent, GPX } from 'leaflet';
import * as L from 'leaflet-gpx';
import { map } from 'jquery';

@Component({
  selector: 'app-register-activity',
  templateUrl: './register-activity.component.html',
  styleUrls: ['./register-activity.component.css']
})
export class RegisterActivityComponent implements OnInit {

  options = {
    layers: [
      tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '...' })
    ],
    zoom: 15,
    center: latLng(9.855319, -83.910799)
  };


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

  mapReference: LeafMap | null = null

  gpxURL: string | null = null;
  gpxLayer: Layer[] = [];

  constructor() {
    let today = new Date()
    this.maxDate = today.getFullYear() + "-" + (today.getMonth() + 1 + "").padStart(2, "0") + "-" + (today.getDate() + '').padStart(2, "0")

    for (let a in ActivityType) {
      if (typeof ActivityType[a] === 'number') this.activityTypes.push(a as (keyof typeof ActivityType));
    }
  }

  ngOnInit(): void {
  }

  onMapReady(map: LeafMap) {
    this.mapReference = map
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
    if (this.gpxURL) {
      URL.revokeObjectURL(this.gpxURL)
    }

    this.gpxLayer = []

    this.gpxURL = URL.createObjectURL(files[0]);

    if (this.mapReference) {
      let gpxMap = this.mapReference;

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

}
