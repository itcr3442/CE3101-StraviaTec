import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
// import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
// import * as gpx from 'leaflet-gpx';

import { AuthGuard } from './guards/auth.guard';

import { UnauthorizedHandlerInterceptor } from './interceptors/unauthorized-handler.interceptor';
import { ForbiddenHandlerInterceptor } from './interceptors/forbidden-handler.interceptor';
import { NotFoundHandlerInterceptor } from './interceptors/not-found-handler.interceptor';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavMenuComponent } from './components/nav-menu/nav-menu.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
// import { NavbarComponent } from './components/navbar/navbar.component';
import { RegisterUserComponent } from './components/register-user/register-user.component';
import { RegisterFormComponent } from './components/register-form/register-form.component';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';
import { ForbiddenComponent } from './components/forbidden/forbidden.component';
import { SettingsDropdownComponent } from './components/settings-dropdown/settings-dropdown.component';
import { EditProfileFormComponent } from './components/edit-profile-form/edit-profile-form.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { SearchUsersComponent } from './components/search-users/search-users.component';
import { RegisterOrgComponent } from './components/register-org/register-org.component';
import { RegisterActivityComponent } from './components/register-activity/register-activity.component';
import { UserRacesComponent } from './components/user-races/user-races.component';
import { UserChallengesComponent } from './components/user-challenges/user-challenges.component';
import { UserGroupsComponent } from './components/user-groups/user-groups.component';
import { UserSubscribedComponent } from './components/user-subscribed/user-subscribed.component';
import { RaceAdminComponent } from './components/race-admin/race-admin.component';
import { SearchFieldComponent } from './components/search-field/search-field.component';
import { UserDashboardComponent } from './components/user-dashboard/user-dashboard.component';


@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    HomeComponent,
    LoginComponent,
    RegisterUserComponent,
    RegisterFormComponent,
    UnauthorizedComponent,
    ForbiddenComponent,
    SettingsDropdownComponent,
    EditProfileFormComponent,
    NotFoundComponent,
    SearchUsersComponent,
    RegisterOrgComponent,
    RegisterActivityComponent,
    UserRacesComponent,
    UserChallengesComponent,
    UserGroupsComponent,
    UserSubscribedComponent,
    RaceAdminComponent,
    SearchFieldComponent,
    UserDashboardComponent,
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    AppRoutingModule,
    LeafletModule,
    FontAwesomeModule,
  ],
  providers: [AuthGuard,
    { provide: HTTP_INTERCEPTORS, useClass: UnauthorizedHandlerInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ForbiddenHandlerInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: NotFoundHandlerInterceptor, multi: true },],
  bootstrap: [AppComponent]
})
export class AppModule { }
