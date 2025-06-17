import { Routes } from '@angular/router';

import { AuthenticatedGuard } from '@client/app/guards/authenticated.guard';
import { UnauthenticatedGuard } from '@client/app/guards/unauthenticated.guard';
import { MeetingJoinResolver } from '@client/app/resolvers/meeting-join.resolver';
import { MeetingParticipantsResolver } from '@client/app/resolvers/meeting-participants.resolver';
import { MeetingResolver } from '@client/app/resolvers/meeting.resolver';
import { LandingPageComponent } from '@client/pages/landing-page/landing-page.component';
import { LogoutPageComponent } from '@client/pages/logout-page/logout-page.component';
import { MainPageComponent } from '@client/pages/main-page/main-page.component';
import { MeetingCreatePageComponent } from '@client/pages/meeting-create-page/meeting-create-page.component';
import { MeetingJoinPageComponent } from '@client/pages/meeting-join-page/meeting-join-page.component';
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
                path: 'meeting/create',
                canActivate: [AuthenticatedGuard],
                component: MeetingCreatePageComponent,
            },
        ],
    },
    {
        path: 'meeting/:uuid',
        resolve: {
            meeting: MeetingResolver,
            participants: MeetingParticipantsResolver,
        },
        canActivate: [AuthenticatedGuard],
        data: {
            inputs: {
                meeting: 'meeting',
                participants: 'participants',
            },
        },
        children: [
            {
                path: 'join',
                component: MeetingJoinPageComponent,
            },
            {
                path: '',
                component: MeetingPageComponent,
                resolve: {
                    join: MeetingJoinResolver,
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
