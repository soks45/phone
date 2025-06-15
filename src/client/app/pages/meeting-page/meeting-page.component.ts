import { ChangeDetectionStrategy, Component, effect, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { TuiButtonModule, TuiDataListModule } from '@taiga-ui/core';
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
    ],
    templateUrl: './meeting-page.component.html',
    styleUrl: './meeting-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeetingPageComponent {
    readonly meeting = input.required<Meeting>();

    localMedia?: MediaStream;

    constructor(private readonly userMediaService: UserMediaService) {
        effect(() => {
            this.localMedia = this.userMediaService.localMediaStream();
        });
    }

    joinMeeting(): void {}
}
