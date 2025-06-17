import { NgClass, NgForOf } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    inject,
    input,
    Signal,
    signal,
    OnInit,
    DestroyRef,
    WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { ResizeObserverModule } from '@ng-web-apis/resize-observer';
import { TuiSidebarModule } from '@taiga-ui/addon-mobile';
import { TuiActiveZoneModule } from '@taiga-ui/cdk';
import { TuiButtonModule, TuiLinkModule, TuiModeModule, TuiScrollbarModule } from '@taiga-ui/core';
import { TuiInputModule, TuiTextareaModule } from '@taiga-ui/kit';

import { GridItemDirective } from '@client/app/ui/grid/grid-item.directive';
import { GridComponent } from '@client/app/ui/grid/grid.component';
import { VideoComponent } from '@client/app/ui/video/video.component';
import { MeetingService } from '@client/services/meeting.service';
import { UserMediaService } from '@client/services/user-media.service';
import { WsService } from '@client/services/ws.service';
import { Meeting } from '@shared/models/meeting';
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
    ],
    templateUrl: './meeting-page.component.html',
    styleUrl: './meeting-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeetingPageComponent implements OnInit {
    readonly meeting = input.required<Meeting>();
    readonly localMedia: Signal<MediaStream | undefined> = inject(UserMediaService).localMediaStream;

    constructor(
        private readonly wsService: WsService,
        private readonly meetingService: MeetingService,
        private readonly destroyRef: DestroyRef
    ) {}

    ngOnInit(): void {
        this.wsService.send({ type: 'meetingConnect', data: { meetingId: this.meeting().id } });
        this.meetingService
            .observePeers(this.meeting().id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((peers) => {
                this.participants.set(peers);
            });
    }

    readonly participants: WritableSignal<WsSession[]> = signal([]);

    readonly messages = [
        { author: 'Артём', text: 'Привет!', time: '12:01', isMine: false },
        {
            author: 'Даниил',
            text: 'Начинаем? Начинаем? Начинаем? Начинаем? ',
            time: '12:02',
            isMine: true,
        },
        { author: 'Артём', text: 'Привет!', time: '12:03', isMine: false },
        {
            author: 'Даниил',
            text: 'Начинаем? Начинаем? Начинаем? Начинаем? ',
            time: '12:04',
            isMine: true,
        },
        { author: 'Артём', text: 'Привет!', time: '12:05', isMine: false },
        {
            author: 'Даниил',
            text: 'Начинаем? Начинаем? Начинаем? Начинаем? ',
            time: '12:06',
            isMine: true,
        },
        { author: 'Артём', text: 'Привет!', time: '12:07', isMine: false },
        {
            author: 'Даниил',
            text: 'Начинаем? Начинаем? Начинаем? Начинаем? ',
            time: '12:08',
            isMine: true,
        },
        { author: 'Артём', text: 'Привет!', time: '12:09', isMine: false },
        {
            author: 'Даниил',
            text: 'Начинаем? Начинаем? Начинаем? Начинаем? ',
            time: '12:010',
            isMine: true,
        },
        { author: 'Артём', text: 'Привет!', time: '12:11', isMine: false },
        {
            author: 'Даниил',
            text: 'Начинаем? Начинаем? Начинаем? Начинаем? ',
            time: '12:12',
            isMine: true,
        },
    ];

    readonly messageForm = new FormGroup({
        message: new FormControl<NullableString>(null),
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
}
