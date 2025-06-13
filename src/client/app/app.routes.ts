import { Routes } from '@angular/router';

import { AuthenticatedGuard } from '@client/app/guards/authenticated.guard';
import { UnauthenticatedGuard } from '@client/app/guards/unauthenticated.guard';
import { MeetingResolver } from '@client/app/resolvers/meeting.resolver';
import { CallPageComponent } from '@client/pages/call-page/call-page.component';
import { LandingPageComponent } from '@client/pages/landing-page/landing-page.component';
import { LogoutPageComponent } from '@client/pages/logout-page/logout-page.component';
import { MainPageComponent } from '@client/pages/main-page/main-page.component';
import { MeetingPageComponent } from '@client/pages/meeting-page/meeting-page.component';
import { SignInPageComponent } from '@client/pages/sign-in-page/sign-in-page.component';
import { SignUpPageComponent } from '@client/pages/sign-up-page/sign-up-page.component';

export const routes: Routes = [
    {
        path: '',
        component: MainPageComponent,
        children: [
            { path: '', component: LandingPageComponent },
            {
                path: 'call',
                component: CallPageComponent,
                canActivate: [AuthenticatedGuard],
            },
            {
                path: 'meeting/:uuid',
                component: MeetingPageComponent,
                canActivate: [AuthenticatedGuard],
                resolve: {
                    meeting: MeetingResolver,
                },
                data: {
                    inputs: {
                        meeting: 'meeting',
                    },
                },
            },
        ],
    },
    {
        path: 'auth',
        children: [
            {
                path: '',
                children: [
                    { path: '', redirectTo: 'sign-in', pathMatch: 'full' },
                    { path: 'sign-in', component: SignInPageComponent },
                    { path: 'sign-up', component: SignUpPageComponent },
                ],
                canActivate: [UnauthenticatedGuard],
            },
            { path: 'logout', component: LogoutPageComponent },
        ],
    },
    {
        path: '**',
        redirectTo: '/',
    },
];
