import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { RepositoryService } from './repository.service';
import { map } from 'rxjs/operators';
import { FormGroup } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { NullableUser, User } from '../interfaces/user';
import { Activity } from '../interfaces/activity';
import { RoleLevels } from '../constants/user.constants';
import { HttpResponse } from '@angular/common/http';
import { Id } from '../interfaces/id';
import { ActivityType } from '../constants/activity.constants';
import { Race } from '../interfaces/race';
import { RaceCategory, RaceCategoryType } from '../constants/races.constants';

export enum gpxType {
  Race,
  Activity
}

@Injectable({
  providedIn: 'root'
})
export class RegisterService {

  constructor(private repositoryService: RepositoryService, private authService: AuthService) { }

  public register_user(user: User, password: string): Observable<HttpResponse<Id>> {

    let new_user = {
      "username": user.username,
      password,
      "firstName": user.firstName,
      "lastName": user.lastName,
      "birthDate": user.birthDate.toISOString(),
      "nationality": user.country,
      "type": RoleLevels[user.type]
    }

    console.log("New user: " + JSON.stringify(new_user))

    // return of({ id: 69 })
    return this.repositoryService.create<Id>(
      "Users", new_user)

  }

  public put_pfp(id: number, image: File): Observable<HttpResponse<null>> {

    return this.repositoryService.replace<null>(
      `Users/${id}/Photo`, image, {}, "image/jpeg")
  }


  public delete_self() {
    return this.repositoryService.delete<null>(
      "Users/0")
  }

  public edit_user(user: NullableUser): Observable<HttpResponse<null>> {
    {
      let edit_user = {
        "username": user.username,
        "firstName": user.firstName,
        "lastName": user.lastName,
        "birthDate": user.birthDate?.toISOString(),
        "nationality": user.country?.alpha2,
      }

      // let id = this.authService.getId()

      return this.repositoryService.edit<null>(
        "Users/0", edit_user)
    }
  }

  public reset_password(id: number, currentP: string, newP: string): Observable<HttpResponse<null>> {
    let updatePassword = {
      current: currentP,
      new: newP
    }

    return this.repositoryService.replace(`Users/${id}/Password`, updatePassword, { skip401: true })
  }

  /**
   * resetea el formgroup dejando todos sus campos vacíos
   * @param formGroup un formgroup a resetear
   */
  public resetForm = (formGroup: FormGroup) => {
    // if (environment.production) {
    Object.values(formGroup.controls).forEach((control) => control.reset())
    // }

  }

  public follow_user(followeeId: number): Observable<HttpResponse<null>> {
    return this.repositoryService.create<null>("Following/" + followeeId, null)
  }


  public unfollow_user(followeeId: number): Observable<HttpResponse<null>> {
    return this.repositoryService.delete<null>("Following/" + followeeId)
  }

  public register_activity(activity: Activity): Observable<HttpResponse<Id>> {

    let new_activity = {
      start: activity.start.toISOString(),
      end: activity.end.toISOString(),
      type: ActivityType[activity.type],
      length: activity.length
    }


    console.log("New activity: " + JSON.stringify(new_activity))

    return this.repositoryService.create<Id>(
      "Activities", new_activity)

  }


  public delete_activity(id: number): Observable<HttpResponse<null>> {

    return this.repositoryService.delete<null>(
      "Activities/" + id)

  }

  public put_gpx(id: number, gpx: File, type: gpxType): Observable<HttpResponse<null>> {

    let baseUrl: string = type === gpxType.Activity ? 'Activities' : 'Races';

    return this.repositoryService.replace<null>(
      `${baseUrl}/${id}/Track`, gpx, {}, "application/xml")
  }

  public register_race(race: Race): Observable<HttpResponse<Id>> {

    let new_race = {
      name: race.name,
      day: race.day.toUTCString(),
      type: ActivityType[race.type],
      price: race.price,
      privateGroups: race.privateGroups,
      categories: race.categories.map((category: RaceCategory) => { return RaceCategory[category] })
    }

    console.log("New race: " + JSON.stringify(new_race))

    return this.repositoryService.create<Id>(
      "Races", new_race)

  }

  public delete_race(id: number): Observable<HttpResponse<null>> {
    return this.repositoryService.delete<null>(
      "Races/" + id)
  }


  public register_user_race(raceId: number, userCategory: string): Observable<HttpResponse<null>> {
    return this.repositoryService.create<null>("Races/" + raceId + "/Registration?category=" + userCategory, null)
  }

  public register_race_receipt(raceId: number, receipt: File | null): Observable<HttpResponse<null>> {
    return this.repositoryService.replace<null>("Races/" + raceId + "/Receipts", receipt, {}, "application/pdf")
  }


  public register_user_challenges(challId: number): Observable<HttpResponse<null>> {
    return this.repositoryService.create<null>("Challenges/" + challId + "/Registration", null)
  }

  public register_user_groups(groupId: number): Observable<HttpResponse<null>> {
    return this.repositoryService.create<null>("Groups/" + groupId + "/Registration", null)
  }

  public post_comment(activityId: number, content: string): Observable<HttpResponse<null>> {
    return this.repositoryService.create<null>(`Activities/${activityId}/Comments`, { content: content })
  }

}
