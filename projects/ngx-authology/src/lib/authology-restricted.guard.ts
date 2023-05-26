
import { Inject, Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { Observable, Observer } from 'rxjs';
import { VarsService } from '@bitfoot/ngx-vars';
import { NavLoadService } from '@bitfoot/ngx-navload';

import { AuthologyService } from './authology.service';


@Injectable()
export class AuthologyRestrictedGuard implements CanActivate {
    constructor(
        @Inject('config') private config: any,
        private authologyService: AuthologyService,
        private router: Router,
        private varsService: VarsService,
        private navLoadService: NavLoadService,
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
                            if (!count) observer.next(true);
                        } else {
                            this.router.navigate([this.config.routes[thisBrand] ? this.config.routes[thisBrand].login : this.config.routes.login]);
                        }
                    });
                });
            } else {
                this.authologyService.cookieAuthCheck().subscribe(res => {
                    if (res) {
                        observer.next(true);
                    } else {
                        if (this.config.routes['redirect'] && !this.config.routes['login']) {
                            window.open(this.varsService.env['authology']['loginUrl'] + '?__redirect=' + window.location.href, '_self');
                        } else {
                            if (this.navLoadService.sitenav.transiting) {
                                this.router.navigate([this.config.routes.login], {
                                    queryParams: {
                                        __redirect: this.navLoadService.sitenav.transiting
                                    }
                                });
                            } else {
                                this.router.navigate([this.config.routes.login]);
                            }
                        }
                    }
                });
            }
        });
    }
}
