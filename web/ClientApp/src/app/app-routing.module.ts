import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './guards/auth.guard';

import { allRoles, RoleLevels } from 'src/app/constants/user.constants';

import { HomeComponent } from './components/home/home.component';

import { LoginComponent } from './components/login/login.component';
import { RegisterUserComponent } from './components/register-user/register-user.component';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';
import { SearchUsersComponent } from './components/search-users/search-users.component';
import { ForbiddenComponent } from './components/forbidden/forbidden.component';
import { RegisterOrgComponent } from './components/register-org/register-org.component';
import { RegisterActivityComponent } from './components/register-activity/register-activity.component';
import { UserRacesComponent } from './components/user-races/user-races.component';
import { UserChallengesComponent } from './components/user-challenges/user-challenges.component';
import { UserGroupsComponent } from './components/user-groups/user-groups.component';
import { UserSubscribedComponent } from './components/user-subscribed/user-subscribed.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { RaceAdminComponent } from './components/race-admin/race-admin.component';
import { ChallengeAdminComponent } from './components/challenge-admin/challenge-admin.component';
import { GroupsAdminComponent } from './components/groups-admin/groups-admin.component';
import { AcceptInscriptionsComponent } from './components/accept-inscriptions/accept-inscriptions.component';
import { ReportParticipantsComponent } from './components/report-participants/report-participants.component';
import { ReportPositionComponent } from './components/report-position/report-position.component';
// import { WorkerAdminComponent } from './components/worker-admin/worker-admin.component';



const routes: Routes = [
  { path: '401', component: UnauthorizedComponent },
  { path: '403', component: ForbiddenComponent },
  { path: '404', component: NotFoundComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterUserComponent, canActivate: [AuthGuard], data: { roles: [] } }, // solo accesible si no está loggeado
  { path: 'search', component: SearchUsersComponent, canActivate: [AuthGuard], data: { roles: [...allRoles] } },
  { path: 'register=org', component: RegisterOrgComponent, canActivate: [AuthGuard], data: { roles: [RoleLevels.Organizer] } },
  { path: 'register=act', component: RegisterActivityComponent, canActivate: [AuthGuard], data: { roles: [...allRoles] } },
  { path: 'subscribe=race', component: UserRacesComponent, canActivate: [AuthGuard], data: { roles: [...allRoles] } },
  { path: 'subscribe=challenge', component: UserChallengesComponent, canActivate: [AuthGuard], data: { roles: [...allRoles] } },
  { path: 'subscribe=group', component: UserGroupsComponent, canActivate: [AuthGuard], data: { roles: [...allRoles] } },
  { path: 'subscriptions', component: UserSubscribedComponent, canActivate: [AuthGuard], data: { roles: [...allRoles] } },
  { path: 'admin=race', component: RaceAdminComponent, canActivate: [AuthGuard], data: { roles: [RoleLevels.Organizer] } },
  { path: 'admin=challenge', component: ChallengeAdminComponent, canActivate: [AuthGuard], data: { roles: [RoleLevels.Organizer] } },
  { path: 'admin=group', component: GroupsAdminComponent, canActivate: [AuthGuard], data: { roles: [RoleLevels.Organizer] } },
  { path: 'admin=inscriptions', component: AcceptInscriptionsComponent, canActivate: [AuthGuard], data: { roles: [RoleLevels.Organizer] } },
  { path: 'report=participants', component: ReportParticipantsComponent, canActivate: [AuthGuard], data: { roles: [RoleLevels.Organizer] } },
  { path: 'report=position', component: ReportPositionComponent, canActivate: [AuthGuard], data: { roles: [RoleLevels.Organizer] } },
  { path: '', component: HomeComponent, pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
