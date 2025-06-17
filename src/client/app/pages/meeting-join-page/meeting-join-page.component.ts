import { SlicePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, Signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { TuiButtonModule } from '@taiga-ui/core';
import {
    TuiAutoColorModule,
    TuiAvatarLabeledModule,
    TuiAvatarModule,
    TuiAvatarOutlineModule,
    TuiAvatarStackModule,
    TuiInitialsModule,
} from '@taiga-ui/experimental';

import { VideoComponent } from '@client/app/ui/video/video.component';
import { UserMediaService } from '@client/services/user-media.service';
import { Meeting } from '@shared/models/meeting';
import { User } from '@shared/models/user';

@Component({
    selector: 'app-meeting-page',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        TuiButtonModule,
        VideoComponent,
        RouterLink,
        TuiAvatarModule,
        TuiAutoColorModule,
        TuiAvatarLabeledModule,
        TuiAvatarOutlineModule,
        TuiAvatarStackModule,
        TuiInitialsModule,
        SlicePipe,
    ],
    templateUrl: './meeting-join-page.component.html',
    styleUrl: './meeting-join-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeetingJoinPageComponent {
    readonly meeting = input.required<Meeting>();
    readonly localMedia: Signal<MediaStream | undefined> = inject(UserMediaService).localMediaStream;
    readonly participants: Signal<User[]> = input.required<User[]>();
    readonly maxParticipantsToDisplay = 4;

    readonly extraParticipantsLength = computed(() =>
        this.participants().length > this.maxParticipantsToDisplay + 1
            ? this.participants().length - this.maxParticipantsToDisplay
            : 0
    );
}
