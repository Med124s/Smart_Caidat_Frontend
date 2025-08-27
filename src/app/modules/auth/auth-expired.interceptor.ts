import {HttpErrorResponse, HttpInterceptorFn} from "@angular/common/http";
import {inject} from "@angular/core";
import {tap} from "rxjs";
import { Oauth2AuthService } from "./oauth2-auth.service";

export const authExpiredInterceptor: HttpInterceptorFn = (req, next) => {
  const oauth2Service = inject(Oauth2AuthService);
  return next(req).pipe(
    tap({
      error: (err: HttpErrorResponse) => {
        if (err.status === 401 && err.url && oauth2Service.isAuthenticated()) {
          oauth2Service.login();
        }
      }
    })
  );
};

// // combined-auth.interceptor.ts
// import { inject, Injectable } from '@angular/core';
// import {
//   HttpInterceptor,
//   HttpRequest,
//   HttpHandler,
//   HttpEvent,
//   HttpErrorResponse
// } from '@angular/common/http';
// import { Observable, tap } from 'rxjs';
// import { Oauth2AuthService } from './oauth2-auth.service';

// @Injectable()
// export class CombinedAuthInterceptor implements HttpInterceptor {

//   oauth2Service = inject(Oauth2AuthService);
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//     const token = this.oauth2Service.accessToken;
//     if (token) {
//       req = req.clone({
//         setHeaders: {
//           Authorization: `Bearer ${token}`
//         }
//       });
//     }

//     return next.handle(req).pipe(
//       tap({
//         error: (err: HttpErrorResponse) => {
//           if (err.status === 401 && err.url && this.oauth2Service.isAuthenticated()) {
//             this.oauth2Service.login();
//           }
//         }
//       })
//     );
//   }
// }
