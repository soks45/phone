import { Routes } from '@angular/router';

import { LandingPageComponent } from '@client/pages/landing-page/landing-page.component';
import { SignInPageComponent } from '@client/pages/sign-in-page/sign-in-page.component';
import { SignUpPageComponent } from '@client/pages/sign-up-page/sign-up-page.component';
import { UserPageComponent } from '@client/pages/user-page/user-page.component';

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
        path: 'user/:id',
        component: UserPageComponent,
    },
];
