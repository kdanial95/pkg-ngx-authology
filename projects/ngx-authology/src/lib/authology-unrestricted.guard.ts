
import { Inject, Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { Observable, Observer } from 'rxjs';

import { AuthologyService } from './authology.service';


@Injectable()
export class AuthologyUnrestrictedGuard implements CanActivate {
    constructor(
        @Inject('config') private config: any,
        private authologyService: AuthologyService,
        private router: Router,
    ) {}


    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const brands = next.data.brands as Array<string>;

        return new Observable((observer: Observer<boolean>) => {
            if (brands && brands.length) {
                let count = brands.length;

                brands.forEach(thisBrand => {
                    this.authologyService.cookieAuthCheck(thisBrand).subscribe(res => {
                        count--;

                        if (res) {
                            if (!count) {
                                this.router.navigate([this.config.routes[thisBrand] ? this.config.routes[thisBrand].default_auth : this.config.routes.default_auth]);
                            }
                        } else {
                            observer.next(true);
                        }
                    });
                });
            } else {
                this.authologyService.cookieAuthCheck().subscribe(res => {
                    if (res) {
                        if (this.config.routes['redirect'] && next.queryParamMap.get('__redirect')) {
                            window.open(next.queryParamMap.get('__redirect'), '_self');
                        } else {
                            this.router.navigate([this.config.routes.default_auth]);
                        }
                    } else {
                        observer.next(true);
                    }
                });
            }
        });
    }
}
