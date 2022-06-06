import { HttpResponse } from '@angular/common/http';
import { ApplicationRef, Component, OnInit } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { RaceCategoryType } from 'src/app/constants/races.constants';
import { Race } from 'src/app/interfaces/race';
import { Participants, ParticipantsResp, Positions, PositionsResp } from 'src/app/interfaces/reports';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { FormattingService } from 'src/app/services/formatting.service';
import { SearchService } from 'src/app/services/search.service';
import jsPDF from 'jspdf';
import { Activity } from 'src/app/interfaces/activity';
import { map, mergeMap } from 'rxjs/operators';

@Component({
  selector: 'app-report-position',
  templateUrl: './report-position.component.html',
  styleUrls: ['./report-position.component.css']
})
export class ReportPositionComponent implements OnInit {

  racesList: { r: Race, id: number }[] = [];

  positions: Positions[] = []


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
    console.log(1)
    this.authService.getPositions(raceId).subscribe(
      (positionsListResp: HttpResponse<PositionsResp[]>) => {
        if (positionsListResp.body) {
          let actUserList: Observable<{
            activities: { act: Activity | null, u: User | null }[], category: RaceCategoryType
          }[]> = forkJoin(positionsListResp.body.map((positionResp: PositionsResp) => {
            let actObs: Observable<Activity | null>[] = positionResp.activities.map((activityId: number) => {
              return this.authService.getActivity(activityId)
            })
            let userObs: Observable<{ act: Activity | null, u: User | null }>[] = actObs.map((actOb: Observable<Activity | null>) => actOb.pipe(mergeMap(
              (act: Activity | null) => {
                if (act) {
                  return forkJoin({ act: actOb, u: this.authService.getUser(act.user) })
                }
                else
                  return of({ act: null, u: null })
              })
            ))

            let returnVal: Observable<{
              activities: { act: Activity | null, u: User | null }[], category: RaceCategoryType
            }> = forkJoin({ activities: forkJoin(userObs), category: of(positionResp.category) })

            return returnVal
          }))
          console.log(2)


          actUserList.subscribe(
            (actSections: {
              activities: { act: Activity | null, u: User | null }[], category: RaceCategoryType
            }[]) => {
              this.positions = actSections.map(
                (section: {
                  activities: { act: Activity | null, u: User | null }[], category: RaceCategoryType
                }) => {
                  let filteredActivities: { act: Activity, u: User }[] = section.activities.filter((activity: { act: Activity | null, u: User | null }) => {
                    return activity.u !== null
                  }) as { act: Activity, u: User }[]
                  return { category: section.category, activities: filteredActivities }
                })
              this.appRef.tick()
              console.log(3)

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
