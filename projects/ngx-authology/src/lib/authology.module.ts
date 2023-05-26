
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';

import { ApiService } from '@bitfoot/ngx-api';
import { CookieService } from 'ngx-cookie-service';

import { JwtInterceptor, TokenInterceptor } from './authology.interceptor';
import { AuthologyService } from './authology.service';


@NgModule({
})
export class AuthologyModule {
    static forRoot(config: any): ModuleWithProviders<AuthologyModule> {
        return {
            ngModule: AuthologyModule,
            providers: [{
                provide: HTTP_INTERCEPTORS,
                useClass: TokenInterceptor,
                multi: true
            }, {
                provide: HTTP_INTERCEPTORS,
                useClass: JwtInterceptor,
                multi: true,
                deps: [
                    AuthologyService
                ]
            }, {
                provide: 'config',
                useValue: config
            },
                ApiService,
                AuthologyService,
                CookieService
            ]
        };
    }
}
