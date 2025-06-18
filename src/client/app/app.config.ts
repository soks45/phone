import { HttpClient, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom, APP_INITIALIZER } from '@angular/core';
import { provideClientHydration, withEventReplay, withHttpTransferCacheOptions } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { TuiRootModule } from '@taiga-ui/core';
import { tuiAvatarOptionsProvider } from '@taiga-ui/experimental';
import { TUI_LANGUAGE, TUI_RUSSIAN_LANGUAGE } from '@taiga-ui/i18n';
import { of } from 'rxjs';

import { API_TOKEN } from '@client/app/tokens/api.token';
import { WS_TOKEN } from '@client/app/tokens/ws.token';
import { AuthService } from '@client/services/auth.service';
import { UserMediaService } from '@client/services/user-media.service';
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
        tuiAvatarOptionsProvider({
            round: true,
            size: 'l',
        }),
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
            useValue: '/ws/',
        },
        {
            provide: APP_INITIALIZER,
            useFactory: (authService: AuthService) => () => authService.initAuthentication(),
            deps: [AuthService],
            multi: true,
        },
        {
            provide: WebRtcConnectionService,
            useFactory: (httpClient: HttpClient, api: string, userMediaService: UserMediaService) => {
                return new WebRtcBrowserConnectionService(httpClient, api, userMediaService);
            },
            deps: [HttpClient, API_TOKEN, UserMediaService],
        },
        {
            provide: WsService,
            useFactory: (wsToken: string, authService: AuthService) => {
                return new WsClientService(wsToken, authService);
            },
            deps: [WS_TOKEN, AuthService],
        },
    ],
};
