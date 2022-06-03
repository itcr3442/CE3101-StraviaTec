import { HttpResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { RoleLevels } from 'src/app/constants/user.constants';
import { AuthService } from 'src/app/services/auth.service';
import { RepositoryService } from 'src/app/services/repository.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent {

  constructor(private authService: AuthService, private repo: RepositoryService) { }

  RoleLevels = RoleLevels; //  accessible in html

  get authenticated(): boolean {
    return this.authService.isLoggedIn()
  }

  get role(): RoleLevels | null {
    if (this.authenticated) {
      return this.authService.getRole()
    }
    else return null
  }

  logout(): void {
    this.authService.logout()
  }


  test() {
    console.log("test")
    // this.repo.getData('Categories/Available').subscribe((resp: HttpResponse))
  }

  categories() {
    this.repo.getData<Array<number>>('Categories/Available').subscribe((resp: HttpResponse<Array<number>>) =>
      console.log("Categories Available:", resp.body))
  }
  races() {
    this.repo.getData<Array<number>>('Races/Available').subscribe((resp: HttpResponse<Array<number>>) =>
      console.log("Races Available:", resp.body))
  }
  challenges() {
    this.repo.getData<Array<number>>('Challenges/Available').subscribe((resp: HttpResponse<Array<number>>) =>
      console.log("Challenges Available:", resp.body))
  }
}
