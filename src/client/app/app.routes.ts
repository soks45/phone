import { Routes } from '@angular/router';

import { CallPageComponent } from '@client/pages/call-page/call-page.component';
import { LandingPageComponent } from '@client/pages/landing-page/landing-page.component';
import { SignInPageComponent } from '@client/pages/sign-in-page/sign-in-page.component';
import { SignUpPageComponent } from '@client/pages/sign-up-page/sign-up-page.component';

export const routes: Routes = [
    { path: '', component: LandingPageComponent },
    {
        path: 'auth',
        children: [
            { path: '', redirectTo: 'sign-in', pathMatch: 'full' },
            { path: 'sign-in', component: SignInPageComponent },
            { path: 'sign-up', component: SignUpPageComponent },
        ],
    },
    {
        path: 'call',
        component: CallPageComponent,
    },
];
