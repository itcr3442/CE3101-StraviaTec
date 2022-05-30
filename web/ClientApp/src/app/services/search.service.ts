import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RepositoryService } from './repository.service';

export interface SearchResp {
  pages: number,
  page: number[]
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor(private repo: RepositoryService) { }

  public searchUserPage(query: string, page: number): Observable<HttpResponse<SearchResp>> {
    let searchUserUrl = "Users/Search?query=" + query + "&page=" + page;
    return this.repo.getData<SearchResp>(searchUserUrl)
  }

  public searchRacesPage(page: number, filterRegistered: boolean , nameLike: string): Observable<HttpResponse<SearchResp>> {
    let searchUserUrl = "Races/Search?page=" + page + "&filterRegistered=" + filterRegistered + "&name" + nameLike;
    return this.repo.getData<SearchResp>(searchUserUrl)
  }
}
