import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, MaybeAsync, Router } from '@angular/router';

import { catchError } from 'rxjs';

import { MeetingService } from '@client/services/meeting.service';
import { Meeting } from '@shared/models/meeting';

@Injectable({
    providedIn: 'root',
})
export class MeetingResolver implements Resolve<Meeting> {
    constructor(
        private readonly meetingService: MeetingService,
        private readonly router: Router
    ) {}

    resolve(route: ActivatedRouteSnapshot): MaybeAsync<Meeting> {
        const uuid = route.paramMap.get('uuid')!;

        return this.meetingService.get(uuid).pipe(
            catchError((err: unknown) => {
                this.router.navigate(['/']);

                throw err;
            })
        );
    }
}
