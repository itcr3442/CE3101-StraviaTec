import { environment } from 'src/environments/environment';
import { Injectable, Inject } from '@angular/core';
import { devUrl } from '../constants/dev.constants'


@Injectable({
  providedIn: 'root'
})
// Clase que contiene el url del API para las llamadas necesarias
export class EnvironmentUrlService {
  public urlAddress: string;

  constructor(@Inject('BASE_URL') baseUrl: string) {
    this.urlAddress = environment.production ? baseUrl : devUrl
  }

}