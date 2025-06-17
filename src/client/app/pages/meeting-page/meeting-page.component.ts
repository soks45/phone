import { AsyncPipe, DatePipe, NgClass, NgForOf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Signal, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { ResizeObserverModule } from '@ng-web-apis/resize-observer';
import { TuiSidebarModule } from '@taiga-ui/addon-mobile';
import { TuiActiveZoneModule } from '@taiga-ui/cdk';
import { TuiButtonModule, TuiLinkModule, TuiModeModule, TuiScrollbarModule } from '@taiga-ui/core';
import { TuiInputModule, TuiTextareaModule } from '@taiga-ui/kit';
import { Observable, shareReplay } from 'rxjs';

import { GridItemDirective } from '@client/app/ui/grid/grid-item.directive';
import { GridComponent } from '@client/app/ui/grid/grid.component';
import { VideoComponent } from '@client/app/ui/video/video.component';
import { AuthService } from '@client/services/auth.service';
import { MeetingService } from '@client/services/meeting.service';
import { UserMediaService } from '@client/services/user-media.service';
import { Meeting } from '@shared/models/meeting';
import { MeetingMessage } from '@shared/models/meeting-message';
import { WsSession } from '@shared/models/ws-session';
import { NullableString } from '@shared/types/nullable';

@Component({
    selector: 'app-meeting-page',
    standalone: true,
    imports: [
        NgForOf,
        TuiButtonModule,
        TuiSidebarModule,
        TuiActiveZoneModule,
        TuiScrollbarModule,
        TuiModeModule,
        ReactiveFormsModule,
        TuiInputModule,
        ReactiveFormsModule,
        TuiLinkModule,
        TuiTextareaModule,
        NgClass,
        ResizeObserverModule,
        GridComponent,
        VideoComponent,
        GridItemDirective,
        DatePipe,
        AsyncPipe,
    ],
    templateUrl: './meeting-page.component.html',
    styleUrl: './meeting-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeetingPageComponent {
    readonly meeting: Meeting = inject(ActivatedRoute).snapshot.data['meeting'];
    readonly currentUser = inject(AuthService).user;

    readonly localMedia: Signal<MediaStream | undefined> = inject(UserMediaService).localMediaStream;

    constructor(private readonly meetingService: MeetingService) {}

    readonly participants$: Observable<WsSession[]> = this.meetingService.observePeers(this.meeting.id).pipe(
        shareReplay({
            refCount: true,
            bufferSize: 1,
        })
    );
    readonly messages$: Observable<MeetingMessage[]> = this.meetingService.observeChatMessages(this.meeting.id).pipe(
        shareReplay({
            refCount: true,
            bufferSize: 1,
        })
    );

    readonly messageForm = new FormGroup({
        message: new FormControl<NullableString>(null, [Validators.required]),
    });

    readonly videoEnabled = signal(true);
    readonly audioEnabled = signal(true);

    readonly chatOpened = signal<boolean>(false);
    readonly participantsOpened = signal<boolean>(false);

    toggleVideo(): void {
        this.videoEnabled.update((v) => !v);
    }

    toggleAudio(): void {
        this.audioEnabled.update((v) => !v);
    }

    toggleChat(open: boolean): void {
        this.chatOpened.set(open);
    }

    toggleParticipants(open: boolean): void {
        this.participantsOpened.set(open);
    }

    meetingPostMessage(): void {
        if (this.messageForm.invalid) {
            return;
        }

        const value: NullableString = this.messageForm.controls.message.value;
        if (value) {
            this.meetingService.postMessage(this.meeting.id, value.trim());
        }
    }

    isMineMessage(message: MeetingMessage): boolean {
        return message.author.id === this.currentUser()?.id;
    }
}
