import { ChangeDetectionStrategy, Component, inject, input, Signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { TuiButtonModule, TuiDataListModule, TuiLoaderModule } from '@taiga-ui/core';
import { TuiDataListWrapperModule, TuiSelectModule } from '@taiga-ui/kit';

import { VideoComponent } from '@client/app/ui/video/video.component';
import { UserMediaService } from '@client/services/user-media.service';
import { Meeting } from '@shared/models/meeting';

@Component({
    selector: 'app-meeting-page',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        TuiButtonModule,
        TuiSelectModule,
        TuiDataListWrapperModule,
        TuiDataListModule,
        VideoComponent,
        TuiLoaderModule,
        RouterLink,
    ],
    templateUrl: './meeting-join-page.component.html',
    styleUrl: './meeting-join-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeetingJoinPageComponent {
    readonly meeting = input.required<Meeting>();
    readonly localMedia: Signal<MediaStream | undefined> = inject(UserMediaService).localMediaStream;
}
