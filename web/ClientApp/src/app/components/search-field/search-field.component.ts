import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { faSearch, faTimes, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { Observable } from 'rxjs';
import { SearchResp, SearchService } from 'src/app/services/search.service';

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

  searchable: Searchables;
  searchResultIds: Array<number> = [69, 420, 1337]
  searchResultNames: Array<string> = ['69', 'lechuga', 'leet']
  selected: boolean = false

  selectedId: number | null = null
  selectedName: string | null = null

  constructor(private searchService: SearchService) {
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

  search(e: Event) {
    // Para que bootstrap no cancele el evento
    e.stopPropagation()

    let searchInput: HTMLInputElement = document.getElementById('searchInput') as HTMLInputElement
    let query = searchInput.value

    // pain no tener match
    if (this.searchable === Searchables.Users) {
      var searchResponse = this.searchService.searchUserPage(query, 0)
    }
    else if (this.searchable === Searchables.Races) {
      var searchResponse = this.searchService.searchUserPage(query, 0)

    } else if (this.searchable === Searchables.Groups) {
      var searchResponse = this.searchService.searchUserPage(query, 0)

    } else if (this.searchable === Searchables.Challenges) {
      var searchResponse = this.searchService.searchUserPage(query, 0)

    } else {
      var searchResponse = {} as Observable<HttpResponse<SearchResp>>
    }

    searchResponse.subscribe((resp: HttpResponse<SearchResp>) => {
      console.log("search resp:", resp)
      this.showDropDown()
    },
      (err: HttpErrorResponse) => {
        console.log('error search:', err)
      })
  }

  select(i: number) {
    this.selectedId = this.searchResultIds[i]
    this.selectedName = this.searchResultNames[i]
    this.selected = true

    let searchInput: HTMLInputElement = document.getElementById('searchInput') as HTMLInputElement
    searchInput.value = this.selectedName

    console.log("Selected id:", this.selectedId)
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
