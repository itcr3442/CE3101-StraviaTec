import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { RegisterService } from 'src/app/services/register.service';
import { SearchService } from 'src/app/services/search.service';
import { getUserCategory, Race } from 'src/app/interfaces/race';
import { User } from 'src/app/interfaces/user';

@Component({
  selector: 'app-user-races',
  templateUrl: './user-races.component.html',
  styleUrls: ['./user-races.component.css']
})
export class UserRacesComponent implements OnInit {

  searchRaceForm = new FormGroup({
    raceName: new FormControl(''),
  })

  raceFileForm = new FormGroup({
  })

  message: string = "";
  currentPage: number = 1;
  races_id_list: number[] = [];
  races_page: Race[] = [];
  amount_of_pages: number = 0;
  isFirstPage: boolean = true;
  isLastPage: boolean = true;
  modalRaceId: number = 0;

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
    this.searchService.searchRacesPage(this.searchQuery)
      .subscribe((res: HttpResponse<number[]>) => {
        if (res.body) {

          let id_list = res.body;

          this.races_page = Array(id_list.length);
          this.amount_of_pages = 1;

          console.log("onSearch id list:", id_list);
          console.log("onSearch pages:", this.amount_of_pages);

          this.races_id_list = id_list
          this.getPageRaces(id_list);
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

  onRegister(raceId: number){
    this.modalRaceId = raceId
  }

  onConfirmRegister() {
    this.authService.getUser(0)
    .subscribe((user: User | null) => {
      if (user) {
        this.registerService.register_user_race(this.modalRaceId,getUserCategory(user.age))
        .subscribe((res: HttpResponse<null>) => {
          console.log("registerUserToRaceResp:", res)
          this.message = "Se ha inscrito correctamente a la carrera deseada"
        })
    }},
    (error: 409) => {
      console.log("Conflict error:", error)
      this.message = "No es posible inscribirse a esta carrera ya que no se cumplen con los requisitos de edad."
    }
    )
  }

}
