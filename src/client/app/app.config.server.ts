import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';

import { UNIVERSAL_PROVIDERS } from '@ng-web-apis/universal';

import { ServerCookieInterceptor } from '@client/app/interceptors/server-cookie.interceptor';
import { API_TOKEN } from '@client/app/tokens/api.token';

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
    ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
