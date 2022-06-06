import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { RegisterService } from 'src/app/services/register.service';
import { SearchService } from 'src/app/services/search.service';
import { getUserCategory, getUserCategoryType, Race } from 'src/app/interfaces/race';
import { User } from 'src/app/interfaces/user';
import { ActivityType } from 'src/app/constants/activity.constants';
import { RaceCategory, RaceStatus } from 'src/app/constants/races.constants';
import { FormattingService } from 'src/app/services/formatting.service';

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
  modalMessage: string = "";
  currentPage: number = 1;
  races_id_list: number[] = [];
  races_page: Race[] = [];
  amount_of_pages: number = 0;
  isFirstPage: boolean = true;
  isLastPage: boolean = true;
  modalRaceId: number = 0;
  pdfFile: File | null = null

  test = new Date();

  constructor(
    private registerService: RegisterService,
    private authService: AuthService,
    private searchService: SearchService,
    public formatter: FormattingService
  ) { }

  ngOnInit(): void {
  }

  get searchQuery(): string {
    return this.searchRaceForm.controls['raceName'].value
  }

  onSearch() {
    this.message = "";
    this.modalMessage = ""
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
        })
    }
  }

  onRegister(raceId: number) {
    this.modalMessage = ""
    this.modalRaceId = raceId
    this.pdfFile = null
    console.log("currentRaceID:", this.modalRaceId)
  }

  onConfirmRegister() {
    this.modalMessage = ""
    if (this.pdfFile !== null) {
      this.authService.getRace(this.modalRaceId)
        .subscribe((race: Race | null) => {
          if (race) {
            this.authService.getUser(0)
              .subscribe((user: User | null) => {
                if (user) {
                  if ((race.categories.includes(RaceCategory.Elite)) || (race.categories.includes(getUserCategoryType(user.age)))) {
                    this.registerService.register_user_race(this.modalRaceId, getUserCategory(user.age))
                      .subscribe((res: HttpResponse<null>) => {
                        console.log("registerUserToRaceResp:", res)

                        this.registerService.register_race_receipt(this.modalRaceId, this.pdfFile)
                          .subscribe((res2: HttpResponse<null>) => {
                            this.hideModal()
                            this.message = "Se ha inscrito correctamente a la carrera deseada"
                            this.refreshPage()
                          })
                      })
                  } else {
                    this.modalMessage = "La carrera a inscribirse es de una categoría que no se le permite competir. Escoja otra carrera válida."
                  }

                }
              })

          }
        })
    } else {
      this.modalMessage = "Ingrese un archivo pdf válido."
    }

  }

  hideModal() {
    let myModalEl: HTMLElement | null = document.getElementById('inscriptionModal');
    if (!!myModalEl) {
      // @ts-ignore
      let modal: bootstrap.Modal | null = bootstrap.Modal.getInstance(myModalEl)
      // console.log("modal:", modal)
      modal?.hide();
    }
  }

  upload(files: FileList) {
    this.pdfFile = files[0]
  }

  isRegistered(raceStatus: RaceStatus) {
    if (raceStatus == RaceStatus.NotRegistered) {
      return false
    } else {
      return true
    }

  }

}
