import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { RegisterService } from 'src/app/services/register.service';
import { SearchService } from 'src/app/services/search.service';
import { GroupSearchDisplay, GroupResp } from 'src/app/interfaces/group';
import { User } from 'src/app/interfaces/user';
import { RoleLevels } from 'src/app/constants/user.constants';
import { Country } from 'src/app/interfaces/country'
@Component({
  selector: 'app-user-groups',
  templateUrl: './user-groups.component.html',
  styleUrls: ['./user-groups.component.css']
})
export class UserGroupsComponent implements OnInit {

  searchGroupForm = new FormGroup({
    groupName: new FormControl(''),
  })

  message: string = "";
  currentPage: number = 1;
  groups_id_list: number[] = [];
  groups_page: GroupSearchDisplay[] = [];
  amount_of_pages: number = 0;
  isFirstPage: boolean = true;
  isLastPage: boolean = true;

  //Eliminar luego de pruebas

  username: string = "Xxjuanpitorico42069xX";
  firstname: string = "Juanpito";
  lastname: string = "Rico";
  groupname: string = "GrupoPichudo";

  //
  constructor(
    private registerService: RegisterService,
    private authService: AuthService,
    private searchService: SearchService,
  ) { }

  ngOnInit(): void {
  }

  get searchQuery(): string {
    return this.searchGroupForm.controls['groupName'].value
  }

  onSearch() {
    this.message = "";
    this.currentPage = 1;
    this.groups_page = [];
    this.amount_of_pages = 0;

    if (this.searchGroupForm.valid) {
      this.refreshPage()
    } else {
      this.message = "Por favor ingrese un nombre válido"
    }
  }

  refreshPage(): void {
    this.searchService.searchGroupsPage(this.searchQuery)
      .subscribe((res: HttpResponse<number[]>) => {
        if (res.body) {

          let id_list = res.body;

          this.groups_page = Array(id_list.length);
          this.amount_of_pages = 1;

          console.log("onSearch id list:", id_list);
          console.log("onSearch pages:", this.amount_of_pages);

          this.groups_id_list = id_list
          this.getPageGroups(id_list);
          this.pageButtonsSetup();

        }
      })
  }

  getPageGroups(id_list: number[]) {
    /*
    CÓDIGO CORRECTO, ESTÁ HARDCODED PARA QUE NO DE ERROR
    AL HACER EL REQUEST DE USUARIOS QUE NO EXISTEN

    for (let j = 0; j < id_list.length; j++) {

      this.authService.getGroup(id_list[j])
        .subscribe((group: GroupSearchDisplay | null) => {
          if (group) {
            console.log("getPageGroups res:", group);
            this.groups_page[j] = group;
            console.log(this.groups_page[j]);
          }
        })
    }
    */
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
    /* NO TOCAR >:(
    this.registerService.register_user_groups(id)
      .subscribe((res: HttpResponse<null>) => {
        console.log("onRegister result:", res);
      })
    this.refreshPage()
    */
  }
}