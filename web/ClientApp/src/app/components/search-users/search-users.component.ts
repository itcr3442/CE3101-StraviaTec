import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Button } from 'bootstrap';
import { Relationships } from 'src/app/constants/user.constants';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { RegisterService } from 'src/app/services/register.service';
import { RepositoryService } from 'src/app/services/repository.service';
import { SearchService } from 'src/app/services/search.service';


@Component({
  selector: 'app-search-users',
  templateUrl: './search-users.component.html',
  styleUrls: ['./search-users.component.css']
})
export class SearchUsersComponent implements OnInit {

  searchUserForm = new FormGroup({
    username: new FormControl(''),
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
    this.searchService.searchUserPage(this.searchQuery)
      .subscribe((res: HttpResponse<number[]>) => {
        if (res.body) {

          let id_list = res.body;
          this.user_id_list = id_list;
          for (let j = 0; j < id_list.length; j++) {
            if(id_list[j] == this.authService.getId()){
              this.user_id_list.splice(j,1)
              break
            }
            continue
          }

          this.users_page = Array(this.user_id_list.length);

          console.log("onSearch id list:", id_list);
          console.log("onSearch pages:", this.amount_of_pages);
          this.user_id_list = id_list
          this.getPageUsers();
        }
      })
  }

  getPageUsers() {
    for (let j = 0; j < this.user_id_list.length; j++) {
      this.authService.getUser(this.user_id_list[j])
      .subscribe((user: User | null) => {
        if (user) {
          console.log("getPageUsers res:", user);
            this.users_page[j] = user;
            console.log(this.users_page[j]);
        }
      })
    }
    console.log("users:", this.users_page)
  }

  onFollow(id: number) {
    this.registerService.follow_user(id)
      .subscribe((res: HttpResponse<null>) => {
        console.log("onFollow result:", res);
        this.message = "Se ha seguido exitosamente al ususario deseado"
      })
    this.refreshPage()
  }

  onUnfollow(id: number) {
    this.registerService.unfollow_user(id)
      .subscribe((res: HttpResponse<null>) => {
        console.log("onUnfollow result:", res);
        this.message = "Se ha dejado de seguir exitosamente al ususario deseado"
      })
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
    return false; //no debería pasar, pero typescript se enoja si no lo pongo;
  }
}