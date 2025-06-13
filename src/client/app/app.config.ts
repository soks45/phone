import { HttpClient, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom, APP_INITIALIZER } from '@angular/core';
import { provideClientHydration, withEventReplay, withHttpTransferCacheOptions } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { TuiRootModule } from '@taiga-ui/core';
import { TUI_LANGUAGE, TUI_RUSSIAN_LANGUAGE } from '@taiga-ui/i18n';
import { of } from 'rxjs';

import { API_TOKEN } from '@client/app/tokens/api.token';
import { WS_TOKEN } from '@client/app/tokens/ws.token';
import { AuthService } from '@client/services/auth.service';
import { WebRtcBrowserConnectionService, WebRtcConnectionService } from '@client/services/web-rtc-connection.service';
import { WsClientService, WsService } from '@client/services/ws.service';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
    providers: [
        provideAnimations(),
        provideZoneChangeDetection(),
        provideClientHydration(withEventReplay(), withHttpTransferCacheOptions({})),
        provideHttpClient(withFetch(), withInterceptorsFromDi()),
        provideRouter(routes, withComponentInputBinding()),
        importProvidersFrom(TuiRootModule),
        {
            provide: TUI_LANGUAGE,
            useValue: of(TUI_RUSSIAN_LANGUAGE),
        },
        {
            provide: API_TOKEN,
            useValue: '/api',
        },
        {
            provide: WS_TOKEN,
            useValue: '/ws',
        },
        {
            provide: APP_INITIALIZER,
            useFactory: (authService: AuthService) => () => authService.initAuthentication(),
            deps: [AuthService],
            multi: true,
        },
        {
            provide: APP_INITIALIZER,
            useFactory: (authService: AuthService) => () => authService.initActiveUserObserving(),
            deps: [AuthService],
            multi: true,
        },
        {
            provide: WebRtcConnectionService,
            useFactory: (httpClient: HttpClient, api: string) => {
                return new WebRtcBrowserConnectionService(httpClient, api);
            },
            deps: [HttpClient, API_TOKEN],
        },
        {
            provide: WsService,
            useFactory: (wsToken: string) => {
                return new WsClientService(wsToken);
            },
            deps: [WS_TOKEN],
        },
    ],
};
