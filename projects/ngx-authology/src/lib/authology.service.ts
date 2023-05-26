
import { Inject, Injectable } from '@angular/core';

import { Observable, Observer } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { ApiService } from '@bitfoot/ngx-api';
import { VarsService } from '@bitfoot/ngx-vars';
import { NavLoadService } from '@bitfoot/ngx-navload';


@Injectable({
    providedIn: 'root'
})
export class AuthologyService {
    isLocalhost: boolean;
    isLocald: boolean;
    brandContext: string = '';


    constructor(
        @Inject('config') private config: any,
        private varsService: VarsService,
        private cookieService: CookieService,
        private apiService: ApiService,
        private navLoadService: NavLoadService,
    ) {
        this.isLocalhost = this.varsService.env['authology']['cookieDomain'].includes('localhost');
        this.isLocald = this.varsService.env['authology']['cookieDomain'].includes('locald');
    }


    /**
     * 
     * @param brand This is the brand of the project.
     */
    brandContextSet(brand: string) {
        this.brandContext = brand;
    }


    /**
     * 
     * @param brand This is the brand of the project. This is an optional parameter and can be used if your project supports multiple brands.
     * @returns 
     */
    cookieAuthCheck(brand?: string) {
        let cookie = this.getCookieBrand('cookieAuth', brand);

        return new Observable((observer: Observer<boolean>) => {
            if (this.cookieService.check(cookie['name'])) {
                this.apiService.get('check-cookie', {}, brand).subscribe(res => {
                    observer.next(true);
                }, err => {
                    observer.next(false);
                });
            } else {
                observer.next(false);
            }
        });
    }


    /**
     * 
     * @param key cookie key name
     * @param value this holds the authToken.
     * @param brand This is the brand of the project. This is an optional parameter and can be used if your project supports multiple brands.
     */
    cookieSet(key: string, value: string, brand?: string) {
        let cookie = this.getCookieBrand(key, brand);

        this.cookieService.set(
            cookie['name'],
            value,
            cookie['expires'],
            cookie['path'] ? cookie['path'] : '/',
            this.domainGet(),
            !(this.isLocalhost || this.isLocald), // localhost is false and remote are true
            ((this.isLocalhost || this.isLocald) ? 'Lax' : 'None')
        );
    }


    /**
     * 
     * @param key Use cookie key name to get the cookie.
     * @param brand This is the brand of the project. This is an optional parameter and can be used if your project supports multiple brands.
     * @returns 
     */
    cookieGet(key: string, brand?: string) {
        let cookie = this.getCookieBrand(key, brand);

        return this.cookieService.get(cookie['name']);
    }


    /**
     * 
     * @param key Use key name to delete the cookie.
     * @param brand This is the brand of the project. This is an optional parameter and can be used if your project supports multiple brands.
     */
    cookieDelete(key: string, brand?: string) {
        let cookie = this.getCookieBrand(key, brand);

        this.cookieService.delete(
            cookie['name'],
            cookie['path'] ? cookie['path'] : '/',
            this.domainGet()
        );
    }


    /**
     * logout
     * Observation: While implementing this function in a project, it was found that if you run
     * this.router.navigate the cookie still shows in console but in reality the cookie has been deleted;
     * the action of cookie deleting is confirmed if you refresh the page or use window.open instead.
     * 
     * @param systemBasedLogout Pass true when __redirect query param should be part of the login url.
     * @returns 
     */
    logout(systemBasedLogout?: boolean) {
        const promises = new Array;

        if (('login_all' in this.config) && this.config['login_all']) {
            Object.keys(this.config['cookieAuth']).forEach(thisBrand => {
                promises.push(new Promise((resolve, reject) => {
                    this.cookieDelete('cookieAuth', thisBrand);
                    resolve(true);
                }));
            });
        } else {
            promises.push(new Promise((resolve, reject) => {
                this.cookieDelete('cookieAuth', this.brandContext);
                resolve(true);
            }));
        }

        return Promise.all([promises]).then((result) => {
            if (this.config.routes['redirect'] && !this.config.routes['login']) {
                window.open(this.varsService.env['authology']['loginUrl'] + '?__redirect=' + location.href, '_self');
            } else {
                if (systemBasedLogout) {
                    window.open('//' + location.host + this.config['routes'].login + '?__redirect=' + this.navLoadService['sitenav']['transiting'], '_self');
                } 
                else if (this.brandContext) {
                    window.open('//' + location.host + '/' + this.config['routes'][this.brandContext].login, '_self');
                }
                else {
                    window.open('//' + location.host + this.config['routes'].login, '_self');
                }
            }
        });
    }


    /**
     * 
     * @param username username or useremail
     * @param password password in plain text
     * @param rememberMe remember me boolean input
     * @returns 
     */
    passportLogin(username: string, password: string, rememberMe: boolean) {
        const promises = new Array;

        if (('login_all' in this.config) && this.config['login_all']) {
            Object.keys(this.config['cookieAuth']).forEach(thisBrand => {
                promises.push(new Promise((resolve, reject) => {
                    this.passportLoginHandler(username, password, thisBrand).subscribe(res => {
                        this.cookieSet('cookieAuth', res.access_token, thisBrand);

                        if (rememberMe) {
                            this.cookieSet('cookieRememberMe', username, thisBrand);
                        } else {
                            this.cookieDelete('cookieRememberMe', thisBrand);
                        }

                        resolve(true);
                    }, err => {
                        reject(err);
                    });
                }));
            });
        } else {
            promises.push(new Promise((resolve, reject) => {
                this.passportLoginHandler(username, password, this.brandContext).subscribe(res => {
                    this.cookieSet('cookieAuth', res.access_token, this.brandContext);

                    if (rememberMe) {
                        this.cookieSet('cookieRememberMe', username, this.brandContext);
                    } else {
                        this.cookieDelete('cookieRememberMe', this.brandContext);
                    }

                    resolve(true);
                }, err => {
                    reject(err);
                });
            }));
        }

        return Promise.all(promises);
    }


    /**
     * This is a private function handles the authentication.
     * 
     * @param username 
     * @param password 
     * @param thisBrand 
     * @returns 
     */
    private passportLoginHandler(username: string, password: string, thisBrand?: string): Observable<any> {
        let cookiesObject = (thisBrand && (thisBrand in this.config['cookieAuth'])) ? this.config['cookieAuth'][thisBrand] : this.config['cookieAuth'];
        let passportObject = (thisBrand && (thisBrand in this.varsService.env['authology']['passport'])) ? this.varsService.env['authology']['passport'][thisBrand] : this.varsService.env['authology']['passport'];

        return this.apiService.post(cookiesObject.ppassport_login.path, {
            body: {
                client_id: passportObject.client_id,
                client_secret: passportObject.client_secret,
                grant_type: passportObject.grant_type,
                scope: cookiesObject.ppassport_login.scope,
                username,
                password,
        }}, thisBrand);
    }


    /**
     * This is a private function to get domain path
     * 
     * @returns domain path
     */
    private domainGet() {
        return (this.isLocalhost ? 'localhost' : this.varsService.env['authology']['cookieDomain']);
    }


    /**
     * This is a private function to get cookie brand
     * 
     * @param key Use key name to get the cookie.
     * @param brand This is the brand of the project. This is an optional parameter and can be used if your project supports multiple brands.
     * @returns 
     */
    private getCookieBrand(key: string, brand?: string) {
        if ('name' in this.config[key]) {
            return this.setCookieNameBasedOnEnv(this.config[key]);
        } else if (brand) {
            return this.setCookieNameBasedOnEnv(this.config[key][brand]);
        } else {
            throw new Error('Please specify brand key.');
        }
    }


    /**
     * setCookieNameBasedOnEnv
     * Keep cookie name unqiue based on environment. This is to avoid creating a conflict with the production environment.
     * 
     * @param configCookieObject 
     * @returns cookie object
     */
    private setCookieNameBasedOnEnv(configCookieObject) {
        let _thisConfigCookieObject = JSON.parse(JSON.stringify(configCookieObject));

        if (this.varsService.env['authology']['env'] != 'production') {
            _thisConfigCookieObject['name'] += this.varsService.env['authology']['env'];
        }

        return _thisConfigCookieObject;
    }
}
