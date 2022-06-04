import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { faBicycle, faHiking, faQuestionCircle, faRunning, faSwimmer, faWalking, faWater, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { registerLocale } from 'i18n-iso-countries';
import { ActivityType } from 'src/app/constants/activity.constants';
import { Activity } from 'src/app/interfaces/activity';
import { User } from 'src/app/interfaces/user';
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

  feedList: Array<UserActivity> = []
  loadingFeed: boolean | null;

  constructor(private authService: AuthService, private formatter: FormattingService) {
    this.loadingFeed = true

    this.refreshFeed()
  }

  ngOnInit(): void {
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
                    this.loadingFeed = false
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
        if (feedErr.status === 404) {
          this.loadingFeed = null
        }
      }
    )
  }

}
