import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './guards/auth.guard';

import { allRoles, RoleLevels } from 'src/app/constants/user.constants';

import { HomeComponent } from './components/home/home.component';

import { LoginComponent } from './components/login/login.component';
import { RegisterUserComponent } from './components/register-user/register-user.component';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';
import { SettingsDropdownComponent } from './components/settings-dropdown/settings-dropdown.component';
import { ForbiddenComponent } from './components/forbidden/forbidden.component';
import { RegisterOrgComponent } from './components/register-org/register-org.component';
import { RegisterActivityComponent } from './components/register-activity/register-activity.component';
import { UserRacesComponent } from './components/user-races/user-races.component';
import { UserChallengesComponent } from './components/user-challenges/user-challenges.component';
import { UserGroupsComponent } from './components/user-groups/user-groups.component';
import { UserSubscribedComponent } from './components/user-subscribed/user-subscribed.component';
// import { WorkerAdminComponent } from './components/worker-admin/worker-admin.component';



const routes: Routes = [
  { path: '401', component: UnauthorizedComponent },
  { path: '403', component: ForbiddenComponent },
  { path: '404', component: UnauthorizedComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterUserComponent, canActivate: [AuthGuard], data: { roles: [] } }, // solo accesible si no está loggeado
  { path: 'register=org', component: RegisterOrgComponent, canActivate: [AuthGuard], data: { roles: [RoleLevels.Organizer] } }, // solo accesible si no está loggeado
  { path: 'register=act', component: RegisterActivityComponent, canActivate: [AuthGuard], data: { roles: [RoleLevels.Athlete] } }, // solo accesible si no está loggeado
  { path: 'subscribe=race', component: UserRacesComponent, canActivate: [AuthGuard], data: { roles: [RoleLevels.Athlete] } }, // solo accesible si no está loggeado
  { path: 'subscribe=challenge', component: UserChallengesComponent, canActivate: [AuthGuard], data: { roles: [RoleLevels.Athlete] } }, // solo accesible si no está loggeado
  { path: 'subscribe=group', component: UserGroupsComponent, canActivate: [AuthGuard], data: { roles: [RoleLevels.Athlete] } }, // solo accesible si no está loggeado
  { path: 'subscriptions', component: UserSubscribedComponent, canActivate: [AuthGuard], data: { roles: [RoleLevels.Athlete] } }, // solo accesible si no está loggeado
  // { path: 'settings', component: SettingsDropdownComponent, canActivate: [AuthGuard], data: { roles: [...allRoles] } },
  { path: '', component: HomeComponent, pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
