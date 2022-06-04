import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { faSearch, faTimes, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { Observable, of } from 'rxjs';
import { SearchService } from 'src/app/services/search.service';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/interfaces/user';
import { map } from 'rxjs/operators';

interface NameHaver {
  name: string
}

export enum Searchables {
  Users,
  Races,
  Challenges,
  Groups
}

declare type SearchablesType = keyof typeof Searchables

@Component({
  selector: 'app-search-field',
  templateUrl: './search-field.component.html',
  styleUrls: ['./search-field.component.css']
})
export class SearchFieldComponent implements OnInit {

  @Input() searchFor: SearchablesType = 'Users';
  @Output() selectEvent = new EventEmitter<{ name: string, id: number }>();

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
  }

  showDropDown(): void {
    let dropdownToggleEl = document.getElementById('dropdownLinkToggle') as HTMLElement
    //@ts-ignore
    let dropdown: Dropdown = new bootstrap.Dropdown(dropdownToggleEl)

    dropdown.show()
  }

  resetSearch(): void {
    this.searchResultIds = []
    this.searchResultNames = []
  }

  search(e: Event) {
    this.loading = true

    // Para que bootstrap no cancele el evento
    e.stopPropagation()

    let searchInput: HTMLInputElement = document.getElementById('searchInput') as HTMLInputElement
    let query = searchInput.value

    // pain no tener match
    if (this.searchable === Searchables.Users) {
      var searchResponse = this.searchService.searchUserPage(query)
    }
    else if (this.searchable === Searchables.Races) {
      var searchResponse = this.searchService.searchRacesPage(query)

    } else if (this.searchable === Searchables.Groups) {
      var searchResponse = this.searchService.searchGroupsPage(query)

    } else if (this.searchable === Searchables.Challenges) {
      var searchResponse = this.searchService.searchChallengesPage(query)

    } else {
      console.error("Se entró a branch de if/else que no debería ser posible entrar en search() de search-field.component.ts")
      var searchResponse = {} as Observable<HttpResponse<number[]>>
    }

    searchResponse.subscribe((searchResp: HttpResponse<number[]>) => {
      // console.log("search resp:", searchResp)
      if (!!searchResp.body) {
        if (this.searchable === Searchables.Users) {
          var getFn: (id: number) => Observable<NameHaver | null> = (id: number) => {
            return this.authService.getUser(id).pipe(map((user: User | null) => {
              if (!!user) {
                // console.log("Found user:", user)
                return { name: `${user.firstName} ${user.lastName} (@${user.username})` }
              }
              return null
            }
            ))
          }
        }
        else if (this.searchable === Searchables.Races) {
          var getFn: (id: number) => Observable<NameHaver | null> = this.authService.getRace

        } else if (this.searchable === Searchables.Groups) {
          var getFn: (id: number) => Observable<NameHaver | null> = this.authService.getGroup

        } else if (this.searchable === Searchables.Challenges) {
          var getFn: (id: number) => Observable<NameHaver | null> = this.authService.getChallenge
        } else {
          console.error("Se entró a branch de if/else que no debería ser posible entrar en search() de search-field.component.ts")
          var getFn: (id: number) => Observable<NameHaver | null> = (_: number) => { return of({ name: "" }) }
        }

        this.resetSearch()

        if (searchResp.body.length < 1) {
          this.loading = null
        }
        else {
          searchResp.body.forEach((id: number, index: number) => {
            getFn(id).subscribe((getResp: NameHaver | null) => {
              if (!!getResp) {
                this.loading = false
                this.searchResultIds.splice(index, 0, id)
                this.searchResultNames.splice(index, 0, getResp.name)
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

  select(i: number) {
    this.selectedId = this.searchResultIds[i]
    this.selectedName = this.searchResultNames[i]
    this.selected = true

    this.selectEvent.emit({ id: this.selectedId, name: this.selectedName })

    let searchInput: HTMLInputElement = document.getElementById('searchInput') as HTMLInputElement
    searchInput.value = this.selectedName

    // console.log("Selected id:", this.selectedId)
  }

  unselect() {
    this.selected = false
    this.selectedId = null
    this.selectedName = null
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
