import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { SKIP_404 } from '../services/repository.service';


@Injectable()
export class NotFoundHandlerInterceptor implements HttpInterceptor {

  constructor(private router: Router) { }



  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (request.context.get(SKIP_404)) {
      return next.handle(request)
    }

    return next.handle(request).pipe(
      catchError(er => {
        if (er.status === 404) {
          this.router.navigate(['/404'])
        }
        return throwError(er);
      })
    );
  }
}
