import { mergeApplicationConfig, ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';

import { UniversalModule } from '@ng-web-apis/universal';

import { appConfig } from './app.config';

const serverConfig: ApplicationConfig = {
    providers: [provideServerRendering(), importProvidersFrom(UniversalModule)],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
