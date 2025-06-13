import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';

import { UNIVERSAL_PROVIDERS } from '@ng-web-apis/universal';

import { ServerCookieInterceptor } from '@client/app/interceptors/server-cookie.interceptor';
import { API_TOKEN } from '@client/app/tokens/api.token';
import { WS_TOKEN } from '@client/app/tokens/ws.token';
import { WebRtcConnectionService } from '@client/services/web-rtc-connection.service';
import { WebRtcServerConnectionService } from '@client/services/web-rtc-connection.service.server';
import { WsService } from '@client/services/ws.service';
import { WsServiceServer } from '@client/services/ws.service.server';

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
            provide: WS_TOKEN,
            useValue: '/ws',
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
        {
            provide: WsService,
            useClass: WsServiceServer,
        },
    ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
