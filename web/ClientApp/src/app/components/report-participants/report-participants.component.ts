import { HttpResponse } from '@angular/common/http';
import { ApplicationRef, Component, OnInit } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { RaceCategoryType } from 'src/app/constants/races.constants';
import { Race } from 'src/app/interfaces/race';
import { Participants, ParticipantsResp } from 'src/app/interfaces/reports';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { FormattingService } from 'src/app/services/formatting.service';
import { SearchService } from 'src/app/services/search.service';
import jsPDF from 'jspdf';


@Component({
  selector: 'app-report-participants',
  templateUrl: './report-participants.component.html',
  styleUrls: ['./report-participants.component.css']
})
export class ReportParticipantsComponent implements OnInit {

  racesList: { r: Race, id: number }[] = [];

  participants: Participants[] = []


  constructor(private authService: AuthService, private searchService: SearchService, public formatter: FormattingService, private appRef: ApplicationRef) { }

  ngOnInit(): void {
    this.refreshRaces()
  }

  sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  downloadReport() {
    this.sleep(1000).then(() => {

      const doc = new jsPDF();
      doc.html(document.getElementById('report')!, {
        callback: function (doc) {
          window.open(window.URL.createObjectURL(doc.output('blob')));
        },
        html2canvas: {
          scale: doc.internal.pageSize.getWidth() / window.innerWidth,
          useCORS: true,
          windowWidth: 1000,
        },
      });
    })
  }

  generateReport(raceId: number) {
    this.authService.getParticipants(raceId).subscribe(
      (participantsListResp: HttpResponse<ParticipantsResp[]>) => {
        if (participantsListResp.body) {
          let participantsList: Observable<{ participants: (User | null)[], category: RaceCategoryType }[]> = forkJoin(participantsListResp.body.map((participantResp: ParticipantsResp) => {
            let userObs: Observable<User | null>[] = participantResp.participants.map((participant: number) => {
              return this.authService.getUser(participant)
            })
            return forkJoin({ participants: forkJoin(userObs), category: of(participantResp.category) })
          }))

          participantsList.subscribe(
            (ParticipantSections: { participants: (User | null)[], category: RaceCategoryType }[]) => {
              this.participants = ParticipantSections.map((section: { participants: (User | null)[], category: RaceCategoryType }) => {
                let filteredParticipants: User[] = section.participants.filter((user: User | null) => user !== null) as User[]
                return { participants: filteredParticipants, category: section.category }
              })
              this.appRef.tick()
              this.downloadReport()

            }
          )
        }
      }
    )
  }

  refreshRaces() {
    this.racesList = []
    this.searchService.searchRacesPage('').subscribe(
      (raceResp: HttpResponse<number[]>) => {
        if (raceResp.body) {
          raceResp.body.forEach(
            (raceId: number) => {
              this.authService.getRace(raceId).subscribe(
                (race: Race | null) => {
                  if (race) {
                    this.racesList.push({ r: race, id: raceId })
                  }
                }
              )
            }
          )
        }
      }
    )
  }
}
