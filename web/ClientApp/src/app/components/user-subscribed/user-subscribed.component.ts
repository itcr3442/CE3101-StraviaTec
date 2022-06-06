import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RaceStatus } from 'src/app/constants/races.constants';
import { Activity } from 'src/app/interfaces/activity';
import { Challenge } from 'src/app/interfaces/challenge';
import { LeaderboardRow, Race } from 'src/app/interfaces/race';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { RegisterService } from 'src/app/services/register.service';
import { SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'app-user-subscribed',
  templateUrl: './user-subscribed.component.html',
  styleUrls: ['./user-subscribed.component.css']
})
export class UserSubscribedComponent implements OnInit {

  constructor(
    private registerService: RegisterService,
    private authService: AuthService,
    private searchService: SearchService,
  ) { }

  raceFilter: RaceStatus = RaceStatus.Registered
  seachbarToggle: Boolean = true
  contentToggle: Boolean = true
  showContentFlag: Boolean = false

  currentRaceId: number = 0
  currentRaceName: string = ""
  leaderboardRaw!: LeaderboardRow[]
  leaderboardAct!: Activity[]
  leaderboardUsers!: User[]
  raceNameMessage: string = ""

  currentChallengeId: number = 0
  currentChallengeName: string = ""
  currentChallenge!: Challenge
  challNameMessage: string = ""

  ngOnInit(): void {
  }

  
  selectedRace(event: { name: string, id: number }) {
    this.raceNameMessage = `Carrera: ${event.name}`
    this.contentToggle = true
    this.showContentFlag = true
    this.currentRaceId = event.id
    this.currentRaceName = event.name
    this.leaderboardRaw = []
    this.leaderboardAct = []
    this.leaderboardUsers = []
    console.log(`Race ID: ${event.id}`)
    this.searchService.searchRaceLeaderboard(this.currentRaceId)
    .subscribe((res: HttpResponse<LeaderboardRow[]>) => {
      if (res.body) {
        this.leaderboardRaw = res.body
        this.leaderboardAct = Array(this.leaderboardRaw.length);
        this.leaderboardUsers = Array(this.leaderboardRaw.length);
        console.log(`Leaderboard: ${this.leaderboardRaw} Name: ${event.name}`)
        this.getActivityLeaderboard()
      }
    })

  }

  getActivityLeaderboard(){
    for (let j = 0; j < this.leaderboardRaw.length; j++) {
      this.authService.getActivity(this.leaderboardRaw[j].activity)
        .subscribe((activity: Activity | null) => {
          if (activity) {
            this.leaderboardAct[j] = activity;
            console.log(this.leaderboardAct[j]);
            this.authService.getUser(activity.user)
            .subscribe((user: User | null) => {
              if (user) {
                this.leaderboardUsers[j] = user;
              }
            })
        }})
    }
  }


  selectedChall(event: { name: string, id: number }) {
    this.challNameMessage = `Reto: ${event.name}`
    this.contentToggle = false
    this.showContentFlag = true
    this.currentChallengeId = event.id
    this.currentChallengeName = event.name
    console.log(`Chall ID: ${event.id} Name: ${event.name}`)
    this.authService.getChallenge(this.currentChallengeId)
    .subscribe((chall: Challenge | null) => {
      if (chall) {
        console.log("getPageChallenges res:", chall);
        this.currentChallenge = chall;
        console.log("Challenge:",this.currentChallenge);
      }
    })
  }

  challenges_searchbar_toggle(){
    this.showContentFlag = false
    this.seachbarToggle  = false
  }

  races_searchbar_toggle(){
    this.showContentFlag = false
    this.seachbarToggle  = true
  }

  secondstoTime(secondsInput: number){
    let hours = Math.floor(secondsInput / 3600)
    let minutes = Math.floor(((secondsInput / 3600) - Math.floor((secondsInput / 3600))) * 60)
    let seconds = Math.floor(((((secondsInput / 3600) - Math.floor((secondsInput / 3600))) * 60) - Math.floor((((secondsInput / 3600) - Math.floor((secondsInput / 3600))) * 60))) * 60)
    return hours + ":" + minutes + ":" + seconds
  }
}
