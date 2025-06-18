import { AsyncPipe, DatePipe, NgClass, NgForOf } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, Renderer2, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ResizeObserverModule } from '@ng-web-apis/resize-observer';
import { TuiSidebarModule } from '@taiga-ui/addon-mobile';
import { TuiActiveZoneModule } from '@taiga-ui/cdk';
import { TuiButtonModule, TuiLinkModule, TuiModeModule, TuiScrollbarModule } from '@taiga-ui/core';
import { TuiInputModule, TuiTextareaModule } from '@taiga-ui/kit';
import { map, Observable, shareReplay, switchMap, take } from 'rxjs';

import { RtcConnection } from '@client/app/models/rtc-connection';
import { GridItemDirective } from '@client/app/ui/grid/grid-item.directive';
import { GridComponent } from '@client/app/ui/grid/grid.component';
import { VideoComponent } from '@client/app/ui/video/video.component';
import { AuthService } from '@client/services/auth.service';
import { MeetingService } from '@client/services/meeting.service';
import { UserMediaService } from '@client/services/user-media.service';
import { Meeting } from '@shared/models/meeting';
import { MeetingMessage } from '@shared/models/meeting-message';
import { MeetingRtcMetadata } from '@shared/models/meeting-rtc-metadata';
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
        RouterLink,
    ],
    templateUrl: './meeting-page.component.html',
    styleUrl: './meeting-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeetingPageComponent {
    readonly meeting: Meeting = inject(ActivatedRoute).snapshot.data['meeting'];
    readonly currentUser = inject(AuthService).user;

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

    readonly meetingConnection$: Observable<RtcConnection> = this.meetingService
        .getMeetingConnection(this.meeting.id)
        .pipe(
            shareReplay({
                refCount: true,
                bufferSize: 1,
            })
        );

    readonly transceivers$: Observable<RTCRtpTransceiver[]> = this.meetingConnection$.pipe(
        map(({ peerConnection }) => {
            return peerConnection.getTransceivers().filter((transceiver) => transceiver.currentDirection !== 'stopped');
        })
    );

    readonly tracks$: Observable<MediaStreamTrack[]> = this.transceivers$.pipe(
        map((transceivers: RTCRtpTransceiver[]) => {
            return transceivers.map(({ receiver }) => receiver).map(({ track }) => track);
        })
    );

    readonly audioTracks$: Observable<MediaStreamTrack[]> = this.tracks$.pipe(
        map((tracks: MediaStreamTrack[]) => {
            return tracks.filter(({ kind }) => kind === 'audio');
        })
    );

    readonly audioStream$: Observable<MediaStream> = this.audioTracks$.pipe(
        map((tracks: MediaStreamTrack[]) => {
            tracks.shift(); // loopback
            return new MediaStream(tracks);
        })
    );

    readonly audio$: Observable<HTMLAudioElement> = this.audioStream$.pipe(
        map((stream: MediaStream) => {
            const audio: HTMLAudioElement = this.renderer.createElement('audio');
            audio.srcObject = stream;
            return audio;
        }),
        shareReplay({
            refCount: true,
            bufferSize: 1,
        })
    );

    readonly audioMuted$: Observable<boolean> = this.audio$.pipe(
        switchMap((audio: HTMLAudioElement) => {
            return new Observable<boolean>((observer) => {
                const update = () => observer.next(audio.muted);
                update();

                const muteUnlisten = this.renderer.listen(audio, 'mute', update);
                const unmuteUnlisten = this.renderer.listen(audio, 'unmute', update);

                return () => {
                    muteUnlisten();
                    unmuteUnlisten();
                };
            });
        }),
        shareReplay({
            refCount: true,
            bufferSize: 1,
        })
    );

    readonly microphoneMuted$: Observable<boolean> = this.userMediaService.microphoneMuted$;
    readonly cameraMuted$: Observable<boolean> = this.userMediaService.cameraMuted$;

    readonly videoTracks$: Observable<MediaStreamTrack[]> = this.tracks$.pipe(
        map((tracks: MediaStreamTrack[]) => {
            return tracks.filter(({ kind }) => kind === 'video');
        })
    );

    readonly videoStreams$: Observable<MediaStream[]> = this.videoTracks$.pipe(
        map((tracks: MediaStreamTrack[]) => tracks.map((track) => new MediaStream([track])))
    );

    readonly meetingMetaData$: Observable<MeetingRtcMetadata> = this.meetingConnection$.pipe(
        switchMap(() => this.meetingService.meetingMetadata(this.meeting.id))
    );

    readonly chatOpened = signal<boolean>(false);
    readonly participantsOpened = signal<boolean>(false);

    readonly messageForm = new FormGroup({
        message: new FormControl<NullableString>(null, [Validators.required]),
    });

    constructor(
        private readonly meetingService: MeetingService,
        private readonly userMediaService: UserMediaService,
        private readonly renderer: Renderer2,
        private readonly destroyRef: DestroyRef
    ) {
        this.playAudio();
    }

    playAudio(): void {
        this.audio$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((audio) => audio.play());
    }

    toggleAudio(): void {
        this.audio$.pipe(take(1), takeUntilDestroyed(this.destroyRef)).subscribe((audio: HTMLAudioElement) => {
            audio.muted = !audio.muted;
            const event = new Event(audio.muted ? 'mute' : 'unmute');
            audio.dispatchEvent(event);
        });
    }

    toggleMicrophone(): void {
        this.userMediaService.toggleMicrophone().pipe(take(1), takeUntilDestroyed(this.destroyRef)).subscribe();
    }

    toggleCamera(): void {
        this.userMediaService.toggleCamera().pipe(take(1), takeUntilDestroyed(this.destroyRef)).subscribe();
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
