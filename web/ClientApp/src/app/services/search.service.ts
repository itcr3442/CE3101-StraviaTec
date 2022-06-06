import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RepositoryService } from './repository.service';
import { LeaderboardRow } from '../interfaces/race';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor(private repo: RepositoryService) { }

  public searchUserPage(query: string): Observable<HttpResponse<number[]>> {
    let searchUserUrl = "Users/Search?query=" + query;// + "&page=" + page;
    return this.repo.getData<number[]>(searchUserUrl)
  }

  public searchRacesPage(query: string): Observable<HttpResponse<number[]>> {
    let searchUserUrl = "Races/Search?query=" + query; //page=" + page + "&filterRegistered=" + filterRegistered + "&nameLike=" + nameLike;
    return this.repo.getData<number[]>(searchUserUrl)
  }

  public searchChallengesPage(query: string): Observable<HttpResponse<number[]>> {
    let searchUserUrl = "Challenges/Search?query=" + query; //page=" + page + "&filterRegistered=" + filterRegistered + "&nameLike=" + nameLike;
    return this.repo.getData<number[]>(searchUserUrl)
  }

  public searchGroupsPage(query: string): Observable<HttpResponse<number[]>> {
    let searchUserUrl = "Groups/Search?query=" + query; // + "&query=" + page;
    return this.repo.getData<number[]>(searchUserUrl)
  }

  public searchRaceLeaderboard(raceId: number): Observable<HttpResponse<LeaderboardRow[]>> {
    let searchUserUrl = "Races/" + raceId + "/Leaderboard";
    return this.repo.getData<LeaderboardRow[]>(searchUserUrl)
  }
}
