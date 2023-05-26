
import { Inject, Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { AuthologyService } from './authology.service';


@Injectable()
export class TokenInterceptor implements HttpInterceptor {
    constructor(
        private authologyService: AuthologyService
    ) {}


    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        request = request.clone({
            headers: request.headers.set("Authorization", `Bearer ${this.authologyService.cookieGet('cookieAuth', request.headers.get('Cookie-Brand'))}`)
        });

        return next.handle(request);
    }
}


export class JwtInterceptor implements HttpInterceptor {
    constructor(
        private authologyService: AuthologyService
    ) {}


    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(tap(
            (event: HttpEvent<any>) => {
                if (event instanceof HttpResponse) {
                    // do stuff with response if you want
                }
            }, (err: any) => {
                if (err instanceof HttpErrorResponse) {
                    console.log('JwtInterceptor', 'err', err);

                    if (err.status === 401 || err.status === 403) {
                        this.authologyService.logout(true);
                    }
                }
            })
        );
    }
}
