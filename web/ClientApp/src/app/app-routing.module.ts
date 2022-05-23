import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './guards/auth.guard';

import { RoleLevels } from 'src/app/constants/user.constants';

import { HomeComponent } from './components/home/home.component';

import { LoginComponent } from './components/login/login.component';
import { RegisterUserComponent } from './components/register-user/register-user.component';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';
// import { WorkerAdminComponent } from './components/worker-admin/worker-admin.component';



const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'login/redirect', component: LoginComponent },
  { path: '401', component: UnauthorizedComponent },
  { path: 'register', component: RegisterUserComponent, canActivate: [AuthGuard], data: { roles: [] } }, // solo accesible si no está loggeado
  // { path: 'worker_register', component: WorkerAdminComponent, canActivate: [AuthGuard], data: { role: RoleLevels.Organizer } },
  { path: '', component: HomeComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
