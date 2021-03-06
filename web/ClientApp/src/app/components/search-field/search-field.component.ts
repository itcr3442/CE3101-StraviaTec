import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { faSearch, faTimes, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { Observable, of } from 'rxjs';
import { SearchService } from 'src/app/services/search.service';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/interfaces/user';
import { map } from 'rxjs/operators';
import { RaceStatus, RaceStatusType } from 'src/app/constants/races.constants';
import { ChallengeStatus, ChallengeStatusType } from 'src/app/constants/challengers.constants';

interface NameHaver {
  name: string
}

export enum Searchables {
  Users,
  Races,
  Challenges,
  Groups,
  Sponsors,
}

declare type SearchablesType = keyof typeof Searchables

@Component({
  selector: 'app-search-field',
  templateUrl: './search-field.component.html',
  styleUrls: ['./search-field.component.css']
})
export class SearchFieldComponent implements OnInit {

  @Input() searchFor: SearchablesType = 'Users';
  @Input() raceStatusFilter: RaceStatusType | undefined = undefined;
  @Input() challStatusFilter: ChallengeStatusType | undefined = undefined
  @Input() groupStatusFilter: boolean | undefined = undefined;
  @Output() selectEvent = new EventEmitter<{ name: string, id: number }>();
  @Output() unselectEvent = new EventEmitter<null>();

  @ViewChild('dropdownLinkToggle') dropdownToggle !: ElementRef;
  @ViewChild('searchInput') searchInput !: ElementRef;

  searchable: Searchables;
  searchResultIds: Array<number> = []
  searchResultNames: Array<string> = []
  selected: boolean = false

  selectedId: number | null = null
  selectedName: string | null = null

  loading: boolean | null = false

  constructor(private searchService: SearchService, private authService: AuthService) {
    this.searchable = Searchables[this.searchFor]
  }

  ngOnInit(): void {
    this.searchable = Searchables[this.searchFor]
  }

  showDropDown(): void {
    let dropdownToggleEl = this.dropdownToggle.nativeElement as HTMLElement
    //@ts-ignore
    let dropdown: Dropdown = new bootstrap.Dropdown(dropdownToggleEl)

    dropdown.show()
  }

  resetSearch(): void {
    this.searchResultIds = []
    this.searchResultNames = []
  }

  get getSearchList(): Observable<HttpResponse<number[]>> {
    let searchInput: HTMLInputElement = this.searchInput.nativeElement
    let query = searchInput.value

    switch (this.searchable) {
      case Searchables.Users: {
        return this.searchService.searchUserPage(query)
      }
      case Searchables.Races: {
        return this.searchService.searchRacesPage(query)

      } case Searchables.Groups: {
        return this.searchService.searchGroupsPage(query)

      } case Searchables.Challenges: {
        return this.searchService.searchChallengesPage(query)

      } case Searchables.Sponsors: {
        return this.searchService.searchSponsorsPage(query)

      } default: {
        console.error("Se entr?? a branch de if/else que no deber??a ser posible entrar en search() de search-field.component.ts")
        return {} as Observable<HttpResponse<number[]>>
      }
    }
  }

  get getFn(): (id: number) => Observable<NameHaver | null> {
    switch (this.searchable) {
      case Searchables.Users: {
        return (id: number) => {
          return this.authService.getUser(id).pipe(map((user: User | null) => {
            if (!!user) {
              // console.log("Found user:", user)
              return { name: `${user.firstName} ${user.lastName} (@${user.username})` }
            }
            return null
          }
          ))
        }
      } case Searchables.Races: {
        return (id: number) => this.authService.getRace(id)

      } case Searchables.Groups: {
        return (id: number) => this.authService.getGroup(id)

      } case Searchables.Challenges: {
        return (id: number) => this.authService.getChallenge(id)
      }
      case Searchables.Sponsors: {
        return (id: number) => this.authService.getSponsor(id)

      } default: {
        console.error("Se entr?? a branch de if/else que no deber??a ser posible entrar en search() de search-field.component.ts")
        return (_: number) => { return of({ name: "" }) }
      }
    }
  }

  search(e: Event) {
    this.loading = true

    // Para que bootstrap no cancele el evento
    e.stopPropagation()

    this.getSearchList.subscribe((searchResp: HttpResponse<number[]>) => {
      // console.log("search resp:", searchResp)
      if (!!searchResp.body) {


        this.resetSearch()

        if (searchResp.body.length < 1) {
          this.loading = null
        }
        else {
          searchResp.body.forEach((id: number, index: number) => {
            this.getFn(id).subscribe((getResp: NameHaver | null) => {
              if (!!getResp) {

                const add = () => {
                  this.searchResultIds.splice(index, 0, id)
                  this.searchResultNames.splice(index, 0, getResp.name)
                }
                switch (this.searchable) {
                  case Searchables.Races: {
                    let status = (<any>getResp).status;
                    switch (this.raceStatusFilter) {
                      case undefined: {
                        add()
                        break
                      }
                      case RaceStatus[status]: {
                        add()
                        break
                      } default: {
                      }
                    }
                    break
                  }
                  case Searchables.Challenges: {
                    let status = (<any>getResp).status;
                    switch (this.challStatusFilter) {
                      case undefined: {
                        add()
                        break
                      }
                      case ChallengeStatus[status]: {
                        add()
                        break
                      } default: {
                      }
                    }
                    break
                  }
                  case Searchables.Groups: {
                    let status = (<any>getResp).amMember;
                    switch (this.groupStatusFilter) {
                      case undefined: {
                        add()
                        break
                      }
                      case status: {
                        add()
                        break
                      } default: {
                      }
                    }
                    break
                  }
                  default: {
                    add()
                  }
                }
                this.loading = false
              }
            })
          })
        }
        this.showDropDown()
      }
    },
      (err: HttpErrorResponse) => {
        // console.log('error buscando:', err)
        this.loading = null
      })
  }

  setValue(id: number) {
    this.getFn(id).subscribe((getResp: NameHaver | null) => {
      if (!!getResp) {
        this.selectedId = id;
        this.selectedName = getResp.name;
        this.selected = true

        let searchInput: HTMLInputElement = this.searchInput.nativeElement
        searchInput.value = this.selectedName
      }
    })
  }

  select(i: number) {
    this.selectedId = this.searchResultIds[i]
    this.selectedName = this.searchResultNames[i]
    this.selected = true

    this.selectEvent.emit({ id: this.selectedId, name: this.selectedName })

    let searchInput: HTMLInputElement = this.searchInput.nativeElement
    searchInput.value = this.selectedName

    // console.log("Selected id:", this.selectedId)
  }

  unselect() {
    this.selected = false
    this.selectedId = null
    this.selectedName = null

    this.unselectEvent.emit(null)
  }

  get resultsAmount(): number {
    return this.searchResultNames.length
  }

  get xIcon(): IconDefinition {
    return faTimes
  }

  get searchIcon(): IconDefinition {
    return faSearch
  }

  counter() {
    // return new Array(5)
    return new Array(this.resultsAmount)
  }

}
