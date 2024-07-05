import { isPlatformServer } from '@angular/common';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';

import { Observable } from 'rxjs';

import { CLIENT_COOKIE_TOKEN } from '@client/app/tokens/client-cookie.token';

@Injectable({
    providedIn: 'root',
})
export class ServerCookieInterceptor implements HttpInterceptor {
    private readonly isServer = isPlatformServer(inject(PLATFORM_ID));
    private readonly cookie = inject(CLIENT_COOKIE_TOKEN);

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (this.isServer && this.cookie) {
            return next.handle(
                req.clone({
                    setHeaders: { cookie: this.cookie },
                })
            );
        }

        return next.handle(req);
    }
}
