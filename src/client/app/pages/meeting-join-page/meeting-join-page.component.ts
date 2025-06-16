import { SlicePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal, Signal } from '@angular/core';
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
    readonly participants = signal([
        { name: 'Артём Репа', id: 1 },
        { name: 'Мария Арбуз', id: 2 },
        { name: 'Иван Болотов', id: 3 },
        { name: 'Артём Синий', id: 4 },
        { name: 'Мария Пеле', id: 5 },
        { name: 'Иван', id: 6 },
        { name: 'Артём', id: 7 },
        { name: 'Мария', id: 8 },
        { name: 'Иван', id: 9 },
        { name: 'Артём', id: 10 },
        { name: 'Мария', id: 11 },
        { name: 'Иван', id: 12 },
        { name: 'Артём', id: 13 },
    ]);
    readonly maxParticipantsToDisplay = 4;

    readonly extraParticipantsLength = computed(() =>
        this.participants().length > this.maxParticipantsToDisplay + 1
            ? this.participants().length - this.maxParticipantsToDisplay
            : 0
    );
}
