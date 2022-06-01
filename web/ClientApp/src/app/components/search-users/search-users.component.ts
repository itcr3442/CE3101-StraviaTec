import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Button } from 'bootstrap';
import { Relationships } from 'src/app/constants/user.constants';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { RegisterService } from 'src/app/services/register.service';
import { RepositoryService } from 'src/app/services/repository.service';
import { SearchResp, SearchService } from 'src/app/services/search.service';


@Component({
  selector: 'app-search-users',
  templateUrl: './search-users.component.html',
  styleUrls: ['./search-users.component.css']
})
export class SearchUsersComponent implements OnInit {

  searchUserForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
  })

  message: string = "";
  currentPage: number = 1;
  user_id_list: number[] = [];
  users_page: User[] = [];
  amount_of_pages: number = 0;
  isFirstPage: boolean = true;
  isLastPage: boolean = true;

  constructor(
    private registerService: RegisterService,
    private authService: AuthService,
    private searchService: SearchService,
  ) { }

  ngOnInit(): void {
  }

  get searchQuery(): string {
    return this.searchUserForm.controls['username'].value
  }

  onSearch() {
    this.message = "";
    this.currentPage = 1;
    this.users_page = [];
    this.amount_of_pages = 0;

    if (this.searchUserForm.valid) {
      this.refreshPage()
    } else {
      this.message = "Por favor ingrese un nombre válido"
    }
  }

  refreshPage(): void {
    this.searchService.searchUserPage(this.searchQuery, this.currentPage)
      .subscribe((res: HttpResponse<SearchResp>) => {
        if (res.body) {

          let id_list = res.body.page;

          this.users_page = Array(id_list.length);
          this.amount_of_pages = res.body.pages;

          console.log("onSearch id list:", id_list);
          console.log("onSearch pages:", this.amount_of_pages);

          this.user_id_list = id_list
          this.getPageUsers(id_list);
          this.pageButtonsSetup();
        }
      })
  }

  getPageUsers(id_list: number[]) {
    for (let j = 0; j < id_list.length; j++) {

      this.authService.getUser(id_list[j])
        .subscribe((user: User | null) => {
          if (user) {
            console.log("getPageUsers res:", user);
            this.users_page[j] = user;
            console.log(this.users_page[j]);
          }
        }
          // No hay que manejar error porque getUser ya maneja el 404
        )
        
    }
    console.log("users:", this.users_page)
  }

  onFollow(id: number) {
    this.registerService.follow_user(id)
      .subscribe((res: HttpResponse<null>) => {
        console.log("onFollow result:", res);
      })

    // TODO: refrescar página?
    // user.isfollowing = !user.isfollowing;
  }

  onUnfollow(id: number) {
    this.registerService.unfollow_user(id)
      .subscribe((res: HttpResponse<null>) => {
        console.log("onUnfollow result:", res);
      })
    // TODO: refrescar página?
    // user.isfollowing = !user.isfollowing;
  }

  pageButtonsSetup() {
    if (this.amount_of_pages == 1 || this.amount_of_pages == 0) {
      this.isFirstPage = true;
      this.isLastPage = true;
    } else if (this.currentPage == 1) {
      this.isFirstPage = true;
      this.isLastPage = false;
    } else if (this.amount_of_pages - this.currentPage == 0) {
      this.isFirstPage = false;
      this.isLastPage = true;
    } else {
      this.isFirstPage = false;
      this.isLastPage = false;
    }
  }

  onPreviousPage() {
    this.currentPage = this.currentPage - 1;
    if (this.currentPage == 0) {
      this.currentPage = 1;
      this.pageButtonsSetup();
      return
    }

    this.refreshPage()
  }

  onNextPage() {
    this.currentPage = this.currentPage + 1;
    if (this.currentPage > this.amount_of_pages) {
      this.currentPage = this.amount_of_pages;
      this.pageButtonsSetup();
      return
    }

    this.refreshPage()
  }

  isFollowing(relationship: Relationships | null): boolean {
    if (relationship == Relationships.Self) {
      return false
    } else if (relationship == null) {
      return false
    } else if (relationship == Relationships.None || relationship == Relationships.FollowedBy) {
      return false
    } else if (relationship == Relationships.Following || relationship == Relationships.BothFollowing) {
      return true
    }
    return false; //no debería pasar;
  }
}