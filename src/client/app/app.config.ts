import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';

import { TuiRootModule } from '@taiga-ui/core';
import { TUI_LANGUAGE, TUI_RUSSIAN_LANGUAGE } from '@taiga-ui/i18n';
import { of } from 'rxjs';

import { API_TOKEN } from '@client/app/tokens/api.token';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
    providers: [
        provideAnimations(),
        provideZoneChangeDetection({ eventCoalescing: true, ignoreChangesOutsideZone: true, runCoalescing: true }),
        provideHttpClient(withFetch()),
        provideRouter(routes),
        provideClientHydration(withEventReplay()),
        importProvidersFrom(TuiRootModule),
        {
            provide: TUI_LANGUAGE,
            useValue: of(TUI_RUSSIAN_LANGUAGE),
        },
        {
            provide: API_TOKEN,
            useValue: '/api',
        },
    ],
};
