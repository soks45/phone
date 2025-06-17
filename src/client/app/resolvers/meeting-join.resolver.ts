import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, MaybeAsync, Router } from '@angular/router';

import { catchError, map } from 'rxjs';

import { MeetingService } from '@client/services/meeting.service';

@Injectable({
    providedIn: 'root',
})
export class MeetingJoinResolver implements Resolve<boolean> {
    constructor(
        private readonly meetingService: MeetingService,
        private readonly router: Router
    ) {}

    resolve(route: ActivatedRouteSnapshot): MaybeAsync<boolean> {
        const uuid = route.paramMap.get('uuid')!;

        return this.meetingService.join(uuid).pipe(
            map(() => true),
            catchError((err: unknown) => {
                this.router.navigate(['/']);

                throw err;
            })
        );
    }
}
