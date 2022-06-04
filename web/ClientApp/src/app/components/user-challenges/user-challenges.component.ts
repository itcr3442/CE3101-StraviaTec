import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { RegisterService } from 'src/app/services/register.service';
import { SearchService } from 'src/app/services/search.service';
import { Challenge } from 'src/app/interfaces/challenge';

@Component({
  selector: 'app-user-challenges',
  templateUrl: './user-challenges.component.html',
  styleUrls: ['./user-challenges.component.css']
})
export class UserChallengesComponent implements OnInit {

  searChallForm = new FormGroup({
    challName: new FormControl(''),
  })

  message: string = "";
  currentPage: number = 1;
  challenges_id_list: number[] = [];
  challenges_page: Challenge[] = [];
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
    return this.searChallForm.controls['challName'].value
  }

  onSearch() {
    this.message = "";
    this.currentPage = 1;
    this.challenges_page = [];
    this.amount_of_pages = 0;

    if (this.searChallForm.valid) {
      this.refreshPage()
    } else {
      this.message = "Por favor ingrese un nombre válido"
    }
  }

  refreshPage(): void {
    this.searchService.searchChallengesPage(this.searchQuery)
      .subscribe((res: HttpResponse<number[]>) => {
        if (res.body) {

          let id_list = res.body;

          this.challenges_page = Array(id_list.length);
          this.amount_of_pages = 1;

          console.log("onSearch id list:", id_list);
          console.log("onSearch pages:", this.amount_of_pages);

          this.challenges_id_list = id_list
          this.getPageChallenges(id_list);
          this.pageButtonsSetup();
        }
      })
  }

  getPageChallenges(id_list: number[]) {
    for (let j = 0; j < id_list.length; j++) {

      this.authService.getChallenge(id_list[j])
        .subscribe((chall: Challenge | null) => {
          if (chall) {
            console.log("getPageChallenges res:", chall);
            this.challenges_page[j] = chall;
            console.log(this.challenges_page[j]);
          }
        })
    }
    console.log("challenges:", this.challenges_page)
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

  onRegister(id: number) {
    this.registerService.register_user_challenges(id)
      .subscribe((res: HttpResponse<null>) => {
        console.log("onRegister result:", res);
      })
    this.refreshPage()
  }

}


