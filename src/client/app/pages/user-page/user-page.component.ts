import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { UserService } from '@client/services/user.service';
import { User } from '@shared/models/user';

@Component({
    selector: 'app-user-page',
    standalone: true,
    imports: [JsonPipe],
    templateUrl: './user-page.component.html',
    styleUrl: './user-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserPageComponent {
    user?: User;

    constructor() {
        const service = inject(UserService);
        const route = inject(ActivatedRoute);
        const cdr = inject(ChangeDetectorRef);
        const id = Number(route.snapshot.params['id']);
        service.getUser(id).subscribe((user) => {
            this.user = user;
            console.log(user);
            cdr.markForCheck();
        });
    }
}
