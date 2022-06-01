import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { RegisterService } from 'src/app/services/register.service';
import { SearchResp, SearchService } from 'src/app/services/search.service';
import { Race } from 'src/app/interfaces/race';

@Component({
  selector: 'app-user-races',
  templateUrl: './user-races.component.html',
  styleUrls: ['./user-races.component.css']
})
export class UserRacesComponent implements OnInit {

  searchRaceForm = new FormGroup({
    raceName: new FormControl('', [Validators.required]),
  })

  message: string = "";
  currentPage: number = 1;
  races_id_list: number[] = [];
  races_page: Race[] = [];
  amount_of_pages: number = 0;
  isFirstPage: boolean = true;
  isLastPage: boolean = true;

  test = new Date();

  constructor(
    private registerService: RegisterService,
    private authService: AuthService,
    private searchService: SearchService,
  ) { }

  ngOnInit(): void {
  }

  get searchQuery(): string {
    return this.searchRaceForm.controls['raceName'].value
  }

  onSearch() {
    this.message = "";
    this.currentPage = 1;
    this.races_page = [];
    this.amount_of_pages = 0;

    if (this.searchRaceForm.valid) {
      this.refreshPage()
    } else {
      this.message = "Por favor ingrese un nombre válido"
    }
  }

  refreshPage(): void {
    this.searchService.searchRacesPage(this.currentPage, true, this.searchQuery)
      .subscribe((res: HttpResponse<SearchResp>) => {
        if (res.body) {

          let id_list = res.body.page;

          this.races_page = Array(id_list.length);
          this.amount_of_pages = res.body.pages;

          console.log("onSearch id list:", id_list);
          console.log("onSearch pages:", this.amount_of_pages);

          this.races_id_list = id_list
          this.getPageRaces(id_list);
          this.pageButtonsSetup();
        }
      })
  }

  getPageRaces(id_list: number[]) {
    for (let j = 0; j < id_list.length; j++) {

      this.authService.getRace(id_list[j])
        .subscribe((race: Race | null) => {
          if (race) {
            console.log("getPageRacers res:", race);
            this.races_page[j] = race;
            console.log(this.races_page[j]);
          }
        }
          // No hay que manejar error porque getUser ya maneja el 404
        )
    }
    console.log("races:", this.races_page)
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
    /* testing no touch >:(
    this.registerService.register_race(id)
      .subscribe((res: HttpResponse<null>) => {
        console.log("onFollow result:", res);
      })
    */
  }

}
