import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FormattingService {

  constructor() { }

  public format_ms(ms: number): string {
    let hours = ms / (1000 * 60 * 60)
    let mins = (hours % 1) * 60
    let secs = (mins % 1) * 60
    // let millis = Math.round((secs % 1) * 1000)
    return this.padTwo(Math.floor(hours)) + ':' + this.padTwo(Math.floor(mins)) + ':' + this.padTwo(Math.round(secs))// + '.' + ('' + Math.floor(millis)).padStart(3, "0")
  }

  toLocalTimeStr(date: Date) {
    return date.getFullYear() + "-" + this.padTwo(date.getMonth() + 1) + "-" + this.padTwo(date.getDate()) + "T" + this.padTwo(date.getHours()) + ":" + this.padTwo(date.getMinutes()) + ":" + this.padTwo(date.getSeconds()) //+ "." + padTwo(date.getMilliseconds())
  }

  public padTwo(n: number): string {
    return (n + "").padStart(2, "0")
  }
}
