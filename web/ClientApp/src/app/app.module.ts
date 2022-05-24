import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AuthGuard } from './guards/auth.guard';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavMenuComponent } from './components/nav-menu/nav-menu.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
// import { NavbarComponent } from './components/navbar/navbar.component';
import { RegisterUserComponent } from './components/register-user/register-user.component';
import { RegisterFormComponent } from './components/register-form/register-form.component';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';
import { SettingsComponent } from './components/settings/settings.component';
import { ForbiddenComponent } from './components/forbidden/forbidden.component';
import { UnauthorizedHandlerInterceptor } from './interceptors/unauthorized-handler.interceptor';
import { ForbiddenHandlerInterceptor } from './interceptors/forbidden-handler.interceptor';




@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    HomeComponent,
    LoginComponent,
    RegisterUserComponent,
    RegisterFormComponent,
    UnauthorizedComponent,
    SettingsComponent,
    ForbiddenComponent,
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    AppRoutingModule,
  ],
  providers: [AuthGuard,
    { provide: HTTP_INTERCEPTORS, useClass: UnauthorizedHandlerInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ForbiddenHandlerInterceptor, multi: true },],
  bootstrap: [AppComponent]
})
export class AppModule { }
