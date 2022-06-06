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
import { GroupedObservable } from 'rxjs';
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

        }
      })
  }

  getPageGroups(id_list: number[]) {
    for (let j = 0; j < id_list.length; j++) {

      this.authService.getGroup(id_list[j])
        .subscribe((group: GroupResp | null) => {
          if (group) {
            console.log("getPageGroups res:", group);

            let groupAdmin = "";
            this.authService.getUser(group.admin)
              .subscribe((user: User | null) => {
              if (user) {
                  console.log("getPageUsers res:", user);
                  groupAdmin = user.username + "/" + user.firstName + " " + user.lastName;
                  this.groups_page[j] = {
                    name: group.name,
                    adminDisplay: groupAdmin,
                    members: group.members,
                    amMember: group.amMember,
                  }
              }})
        }})
    }
  }

  onRegister(id: number) {
    this.registerService.register_user_groups(id)
      .subscribe((res: HttpResponse<null>) => {
        console.log("onRegister result:", res);
        this.message = "Se ha registrado exitosamente al grupo deseado"
      })
    
    this.refreshPage()
  }

  onUnregister(id: number) {
    this.registerService.unregister_user_groups(id)
      .subscribe((res: HttpResponse<null>) => {
        console.log("onRegister result:", res);
        this.message = "Se ha salido exitosamente del grupo deseado"
      })
    
    this.refreshPage()
  }
}