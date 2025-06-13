import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';

import { UNIVERSAL_PROVIDERS } from '@ng-web-apis/universal';

import { ServerCookieInterceptor } from '@client/app/interceptors/server-cookie.interceptor';
import { API_TOKEN } from '@client/app/tokens/api.token';
import { WebRtcConnectionService } from '@client/services/web-rtc-connection.service';
import { WebRtcServerConnectionService } from '@client/services/web-rtc-connection.service.server';

import { appConfig } from './app.config';

const serverConfig: ApplicationConfig = {
    providers: [
        provideServerRendering(),
        UNIVERSAL_PROVIDERS,
        {
            provide: API_TOKEN,
            useValue: '/api',
        },
        {
            provide: HTTP_INTERCEPTORS,
            useExisting: ServerCookieInterceptor,
            multi: true,
        },
        {
            provide: WebRtcConnectionService,
            useClass: WebRtcServerConnectionService,
        },
    ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
