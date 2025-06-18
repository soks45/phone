import { AsyncPipe, SlicePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, input, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
import { Observable } from 'rxjs';

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
        AsyncPipe,
    ],
    templateUrl: './meeting-join-page.component.html',
    styleUrl: './meeting-join-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeetingJoinPageComponent {
    readonly meeting = input.required<Meeting>();
    readonly localMedia: Signal<MediaStream | undefined> = this.userMediaService.localMediaStream;
    readonly microphoneMuted$: Observable<boolean> = this.userMediaService.microphoneMuted$;
    readonly cameraMuted$: Observable<boolean> = this.userMediaService.cameraMuted$;

    readonly participants: Signal<User[]> = input.required<User[]>();
    readonly maxParticipantsToDisplay = 4;

    readonly extraParticipantsLength = computed(() =>
        this.participants().length > this.maxParticipantsToDisplay + 1
            ? this.participants().length - this.maxParticipantsToDisplay
            : 0
    );

    constructor(
        private readonly userMediaService: UserMediaService,
        private readonly destroyRef: DestroyRef
    ) {}

    toggleMicrophone(): void {
        this.userMediaService.toggleMicrophone().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    }

    toggleCamera(): void {
        this.userMediaService.toggleCamera().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    }
}
