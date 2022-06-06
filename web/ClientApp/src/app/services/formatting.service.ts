import { Injectable } from '@angular/core';
import { ActivityType } from '../constants/activity.constants';
import { RaceCategory } from '../constants/races.constants';

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

  toDateStr(date: Date) {
    return date.getFullYear() + "-" + (date.getMonth() + 1 + "").padStart(2, "0") + "-" + (date.getDate() + "").padStart(2, "0")
  }

  public padTwo(n: number): string {
    return (n + "").padStart(2, "0")
  }

  raceTypeToString(raceType: ActivityType) {
    return ActivityType[raceType]
  }

  raceCategoriestoString(raceCategory: RaceCategory[]) {
    let stringCategories = Array(raceCategory.length);
    for (let j = 0; j < raceCategory.length; j++) {
      stringCategories[j] = RaceCategory[raceCategory[j]]
    }
    console.log("stringCategories:", stringCategories)
    return stringCategories
  }
}
