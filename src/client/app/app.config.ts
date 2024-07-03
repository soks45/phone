import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';

import { TuiRootModule } from '@taiga-ui/core';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
    providers: [
        provideAnimations(),
        provideZoneChangeDetection({ eventCoalescing: true, ignoreChangesOutsideZone: true, runCoalescing: true }),
        provideHttpClient(withFetch()),
        provideRouter(routes),
        provideClientHydration(withEventReplay()),
        importProvidersFrom(TuiRootModule),
    ],
};
