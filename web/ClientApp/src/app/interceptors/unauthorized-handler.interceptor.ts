import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { SKIP_401 } from '../services/repository.service';
import { networkInterfaces } from 'os';
import { Router } from '@angular/router';

@Injectable()
export class UnauthorizedHandlerInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService, private router: Router) { }
  //function which will be called for all http calls
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    if (request.context.get(SKIP_401)) {
      return next.handle(request)
    }

    return next.handle(request).pipe(
      catchError(er => {
        if (er.status === 401) {
          this.authService.logout(false);
          this.router.navigate(['/401'])
        }
        return throwError(er);
      })
    );
  }

}
