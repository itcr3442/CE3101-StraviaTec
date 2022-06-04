import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { faBicycle, faHiking, faRunning, faSwimmer, faWalking, faWater } from '@fortawesome/free-solid-svg-icons';
import { Activity } from 'src/app/interfaces/activity';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';

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

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
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
    )
  }

}
