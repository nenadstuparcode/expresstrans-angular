import { Injectable } from '@angular/core';
import {HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import {UserServiceService} from '@app/services/user-service.service';
import {Router} from "@angular/router";

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  public headers: HttpHeaders;
  constructor(private accountService: UserServiceService, private router: Router) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // add auth header with jwt if user is logged in and request is to the api url

    const user = this.accountService.getUser();
    const isLoggedIn = user && user.token;
    const isApiUrl = request.url.startsWith(environment.apiUrl);

    if (isLoggedIn && isApiUrl) {
      request = request.clone({
        setHeaders: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
          //Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MTk2ODdkMGZiZGI4MDQ4Yzg5ZTQwMWMiLCJmaXJzdE5hbWUiOiJOZW5hZCIsImxhc3ROYW1lIjoiU3R1cGFyIiwiZW1haWwiOiJndW1lQG5vdmF2aXppamEub3JnIiwiaWF0IjoxNjM4MzcxODY4LCJleHAiOjE2MzgzNzkwNjh9.pDZqFOnhdA9jf35V--yfTkEF5dx2Asy9H_6WO99PVtU`,
        }
      });
    } else {
      this.accountService.logout();
      this.router.navigate(['/login']);
    }

    return next.handle(request);
  }
}
