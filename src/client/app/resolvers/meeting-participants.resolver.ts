import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, MaybeAsync, Router } from '@angular/router';

import { catchError } from 'rxjs';

import { MeetingService } from '@client/services/meeting.service';
import { User } from '@shared/models/user';

@Injectable({
    providedIn: 'root',
})
export class MeetingParticipantsResolver implements Resolve<User[]> {
    constructor(
        private readonly meetingService: MeetingService,
        private readonly router: Router
    ) {}

    resolve(route: ActivatedRouteSnapshot): MaybeAsync<User[]> {
        const uuid = route.paramMap.get('uuid')!;

        return this.meetingService.participants(uuid).pipe(
            catchError((err: unknown) => {
                this.router.navigate(['/']);

                throw err;
            })
        );
    }
}
