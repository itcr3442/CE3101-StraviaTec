import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Button } from 'bootstrap';
import { UserSearchByID } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { RepositoryService } from 'src/app/services/repository.service';


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
  user_id_list !: string[];
  users_page !: UserSearchWithID[];
  amount_of_pages : number = 0;
  isFirstPage : boolean = true;
  isLastPage : boolean = true;

  constructor(
    private repo: RepositoryService,
    private authRepo: AuthService,
  ) { }

  ngOnInit(): void {
  }

  onSearch() {
    this.message = "";
    this.currentPage = 1;
    this.user_id_list = [];
    this.users_page = [];
    this.amount_of_pages = 0;
    if (this.searchUserForm.valid) {
      let searchUserUrl = "Users/Search?query=" + this.searchUserForm.controls['username'].value + "&page=" + this.currentPage;
      this.repo.getData(searchUserUrl)
      .subscribe((res: HttpResponse<any>) => {
        console.log("Result:",res);
        this.user_id_list = res.body.page as string[];
        this.users_page = Array(this.user_id_list.length);
        this.amount_of_pages = res.body.pages;
        console.log(this.user_id_list);
        console.log(this.amount_of_pages);
        this.getPageUsers();
        this.pageButtonsSetup();
      })
    }else{
      this.message = "Por favor ingrese un nombre válido"
    }
  }

  getPageUsers() {
    for (let j = 0; j < this.user_id_list.length; j++){
      let searchUserUrl = "Users/" + this.user_id_list[j];
      this.repo.getData(searchUserUrl)
      .subscribe((res: HttpResponse<any>) => {
        console.log("Result:",res);
        let incompleteUser : UserSearchWithID = 
        {
          id:             this.user_id_list[j],
          username:       res.body.username,
          firstName:      res.body.firstName,
          lastName:       res.body.lastName,
          birthDate:      res.body.birthDate,
          age:            res.body.age, 
          nationality:    res.body.nationality,
          relationship:   res.body.relationship,
          isfollowing:    this.isFollowing(res.body.relationship)
        };
        this.users_page[j] = incompleteUser;
        console.log(this.users_page[j]);
      }
      /*,
      (error: HttpErrorResponse) => {
        console.log("user not found: ", error)
        let error_user : UserSearchWithID = 
                      {
                        id:             this.user_id_list[j],
                        username:       "not_found",
                        firstName:      "not_found",
                        lastName:       "not_found",
                        birthDate:      new Date(0),
                        age:            0, 
                        nationality:    "not_found",
                        relationship:   "not_found"
                      }
        this.users_page[j] = error_user;
        
      }*/
      )
    }
    console.log("users:", this.users_page)
  }

  onFollow(id:string, user: UserSearchWithID){
    let searchUserUrl = "Following/" + id;
    this.repo.create(searchUserUrl,"")
    .subscribe((res: HttpResponse<any>) => {
      console.log("Result:",res);
    })
    user.isfollowing = !user.isfollowing;
  }

  onUnfollow(id:string, user: UserSearchWithID){
    let searchUserUrl = "Following/" + id;
    this.repo.delete(searchUserUrl)
    .subscribe((res: HttpResponse<any>) => {
      console.log("Result:",res);
    })
    user.isfollowing = !user.isfollowing;
  }

  pageButtonsSetup(){
    if (this.amount_of_pages == 1 ||this.amount_of_pages == 0){
      this.isFirstPage = true;
      this.isLastPage = true;
    } else if (this.currentPage == 1){
      this.isFirstPage = true;
      this.isLastPage = false;
    } else if (this.amount_of_pages - this.currentPage == 0){
      this.isFirstPage = false;
      this.isLastPage = true;
    } else{
      this.isFirstPage = false;
      this.isLastPage = false;
    }
  }

  onPreviousPage(){
    this.currentPage = this.currentPage - 1;
    if (this.currentPage == 0){
      this.currentPage = 1;
      this.pageButtonsSetup();
      return
    }
    let searchUserUrl = "Users/Search?query=" + this.searchUserForm.controls['username'].value + "&page=" + this.currentPage;
    this.repo.getData(searchUserUrl)
    .subscribe((res: HttpResponse<any>) => {
      console.log("Result:",res);
      this.user_id_list = res.body.page as string[];
      this.users_page = Array(this.user_id_list.length);
      console.log(this.user_id_list);
      this.getPageUsers();
      this.pageButtonsSetup();
    })
  }

  onNextPage(){
    this.currentPage = this.currentPage + 1;
    if (this.currentPage > this.amount_of_pages){
      this.currentPage = this.amount_of_pages;
      this.pageButtonsSetup();
      return
    }
    let searchUserUrl = "Users/Search?query=" + this.searchUserForm.controls['username'].value + "&page=" + this.currentPage;
    this.repo.getData(searchUserUrl)
    .subscribe((res: HttpResponse<any>) => {
      console.log("Result:",res);
      this.user_id_list = res.body.page as string[];
      this.users_page = Array(this.user_id_list.length);
      console.log(this.user_id_list);
      this.getPageUsers();
      this.pageButtonsSetup();
    })
  }

  isFollowing(relationship:string): boolean{
    if(relationship == "Self"){
      return false
    } else if(relationship == "None" || relationship == "FollowedBy"){
      return false
    }else if(relationship == "Following" || relationship == "BothFollowing"){
      return true
    }
    return false; //no debería pasar;
  }
}

interface UserSearchWithID {
  id:             string,
  username:       string,
  firstName:      string,
  lastName:       string,
  birthDate:      Date,
  age:            number, 
  nationality:    string,
  relationship:   string,
  isfollowing:      boolean,
}
