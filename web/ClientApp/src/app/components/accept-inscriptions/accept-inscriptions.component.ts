import { HttpResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { Browser } from 'leaflet';
import { Race } from 'src/app/interfaces/race';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { RegisterService } from 'src/app/services/register.service';
import { SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'app-accept-inscriptions',
  templateUrl: './accept-inscriptions.component.html',
  styleUrls: ['./accept-inscriptions.component.css']
})
export class AcceptInscriptionsComponent implements OnInit {

  receipts_list: { u: User, r: Race, raceId: number, userId: number }[] = []
  baseUrl: string;

  constructor(private authService: AuthService, private registerService: RegisterService, private searchService: SearchService, @Inject('BASE_URL') baseUrl: string) {
    this.baseUrl = baseUrl
  }

  ngOnInit(): void {
    this.refreshInscriptions()
  }

  getReceipt(raceId: number, userId: number) {

    let link = `${this.baseUrl}Api/Races/${raceId}/Receipts/${userId}`
    console.log("download link:", link)

    let element = document.createElement('a');
    element.setAttribute('href', link);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  refreshInscriptions() {
    this.receipts_list = []
    this.searchService.searchRacesPage('').subscribe(
      (raceResp: HttpResponse<number[]>) => {
        if (raceResp.body) {
          raceResp.body.forEach(
            (raceId: number) => {
              this.authService.getRace(raceId).subscribe(
                (race: Race | null) => {
                  this.authService.getReceipts(raceId).subscribe(
                    (receiptsResp: HttpResponse<number[]>) => {
                      if (receiptsResp.body) {
                        receiptsResp.body.forEach(
                          (userId) => {
                            this.authService.getUser(userId).subscribe(
                              (user: User | null) => {
                                if (user && race) {
                                  console.log(`Found receipt: user ${userId}, race ${raceId}`)
                                  this.receipts_list.push({ u: user, r: race, raceId, userId })
                                }
                              }
                            )
                          }
                        )
                      }
                    }
                  )
                }
              )
            }
          )
        }
      }
    )
  }


  accept(raceId: number, userId: number) {
    this.registerService.accept_inscription(raceId, userId).subscribe(
      (resp: HttpResponse<null>) => {
        console.log("resp:", resp)
        this.refreshInscriptions()
      }
    )
  }

  deny(raceId: number, userId: number) {
    this.registerService.deny_inscription(raceId, userId).subscribe(
      (_: HttpResponse<null>) => {
        this.refreshInscriptions()
      }
    )
  }

}
