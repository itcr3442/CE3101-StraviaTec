import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { ApplicationRef, Component, Inject, OnInit } from '@angular/core';
import { faBicycle, faHiking, faQuestionCircle, faRunning, faSwimmer, faWalking, faWater, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { latLng, Layer, tileLayer, Map as LeafMap, LayerEvent } from 'leaflet';
import { Observable } from 'rxjs';
import { ActivityType } from 'src/app/constants/activity.constants';
import { Activity } from 'src/app/interfaces/activity';
import { User, UserStats } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { FormattingService } from 'src/app/services/formatting.service';

interface UserActivity {
  user: User,
  activity: Activity
}

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {

  icons = {
    running: faRunning,
    cycling: faBicycle,
    kayaking: faWater,
    hiking: faHiking,
    swimming: faSwimmer,
    walking: faWalking
  }

  idList: Array<number> = []
  feedList: Array<UserActivity> = []
  selfList: Array<Activity> = []
  loadingFeed: boolean;

  userInfo: User | null = null
  userStats: UserStats | null = null
  lastActivity: Activity | null = null

  baseURL: string;

  // opciones para mapa inicial, no editar
  options = {
    layers: [
      tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '...' })
    ],
    zoom: 15,
    center: latLng(9.855319, -83.910799)
  };
  // Referencia al mapa
  gpxMapReference: LeafMap | null = null
  // layers del mapa, se usa solo para meter el layer del gpx
  gpxLayer: Layer[] = [];


  constructor(private authService: AuthService, private formatter: FormattingService, private appRef: ApplicationRef, @Inject('BASE_URL') baseUrl: string) {
    this.loadingFeed = true
    this.baseURL = baseUrl

    this.refreshFeed()
    this.refreshSelf()
  }

  ngOnInit(): void {
    this.refreshUser()
    this.refreshStats()
  }

  getIconForType(type: ActivityType): IconDefinition {
    if (type === ActivityType.Cycling) {
      return this.icons.cycling
    } else if (type === ActivityType.Hiking) {
      return this.icons.hiking
    } else if (type === ActivityType.Kayaking) {
      return this.icons.kayaking
    } else if (type === ActivityType.Running) {
      return this.icons.running
    } else if (type === ActivityType.Swimming) {
      return this.icons.swimming
    } else if (type === ActivityType.Walking) {
      return this.icons.walking
    }
    return faQuestionCircle
  }

  getDuration(activity: Activity) {
    return this.formatter.format_ms(activity.end.getTime() - activity.start.getTime())
  }

  get activityTypes(): typeof ActivityType {
    return ActivityType
  }

  rerenderFeed(): void {
    this.appRef.tick()
  }

  get selectedFeed(): string {
    let feedSelect: HTMLSelectElement = document.getElementById('feed-select') as HTMLSelectElement
    return feedSelect.value
  }

  refreshUser(): void {
    this.authService.getUser(0).subscribe((user: User | null) => {
      if (user) {
        user.type = this.authService.getRole()
        this.userInfo = user
      }
    })
  }

  refreshStats(): void {
    this.authService.getStats(0).subscribe(
      (resp: HttpResponse<UserStats>) => {
        if (resp.body) {
          this.userStats = resp.body
          if (!!this.userStats.latestActivity) {
            this.authService.getActivity(this.userStats.latestActivity).subscribe((act: Activity | null) => {
              if (act) {
                this.lastActivity = act
              }
            })
          }
        }
      },
      (err: HttpErrorResponse) => console.log("Error in refreshStats():", err)
    )
  }




  refreshSelf(): void {
    this.authService.getHistory(0).subscribe(
      (resp: HttpResponse<number[]>) => {
        if (resp.body) {

          resp.body.forEach((actId: number, index: number) => {
            this.authService.getActivity(actId).subscribe((activity: Activity | null) => {
              if (activity) {
                this.selfList.splice(index, 0, activity)
                this.rerenderFeed()
              }
            })
          })

        }
      },
      (err: HttpErrorResponse) => console.log("Error in refreshStats():", err)
    )
  }

  refreshFeed(): void {
    this.authService.getFeed().subscribe(
      (feedResp: HttpResponse<number[]>) => {
        if (feedResp.body) {
          feedResp.body.forEach((actId: number, index: number) => {
            this.authService.getActivity(actId).subscribe((activity: Activity | null) => {
              if (activity) {
                this.authService.getUser(activity.user).subscribe((user: User | null) => {
                  if (user) {
                    this.feedList.splice(index, 0, { user, activity })
                    this.idList.splice(index, 0, actId)
                    this.rerenderFeed()
                  }
                })
              }
            })

          }
          )
        }
      },
      (feedErr: HttpErrorResponse) => {
        console.log("Error getting feed:", feedErr)

      }
    ).add(() => this.loadingFeed = false)
  }


  onMapReady(map: LeafMap) {
    this.gpxMapReference = map
  }

  loadGpx(actId: number) {

  }

}
