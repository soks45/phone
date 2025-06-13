import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DestroyRef,
    effect,
    ElementRef,
    inject,
    Signal,
    viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';

import { NAVIGATOR } from '@ng-web-apis/common';
import { TuiButtonModule, TuiLinkModule } from '@taiga-ui/core';
import { from } from 'rxjs';

import { WebRtcConnectionService } from '@client/services/web-rtc-connection.service';
import { WebRtcConnectionDto } from '@shared/models/web-rtc-connection.dto';

@Component({
    selector: 'app-call-page',
    standalone: true,
    imports: [TuiButtonModule, TuiLinkModule],
    templateUrl: './call-page.component.html',
    styleUrl: './call-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CallPageComponent {
    private readonly localVideo: Signal<ElementRef<HTMLVideoElement>> =
        viewChild.required<ElementRef<HTMLVideoElement>>('localVideo');
    private readonly remoteVideo: Signal<ElementRef<HTMLVideoElement>> =
        viewChild.required<ElementRef<HTMLVideoElement>>('remoteVideo');
    private readonly navigator: Navigator = inject(NAVIGATOR);
    private readonly localMediaStream: Signal<MediaStream | undefined> = toSignal<MediaStream>(
        from(
            this.navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true,
            })
        )
    );

    private remoteConnection?: WebRtcConnectionDto;

    constructor(
        private readonly webRtcConnectionService: WebRtcConnectionService,
        private destroyRef: DestroyRef,
        private readonly cdr: ChangeDetectorRef
    ) {
        effect(() => {
            const localMedia = this.localMediaStream();
            const videoTag = this.localVideo().nativeElement;
            const remoteVideoTag = this.remoteVideo().nativeElement;
            if (localMedia) {
                videoTag.srcObject = localMedia;
                videoTag.autoplay = true;
                videoTag.muted = true;
            }
            remoteVideoTag.autoplay = true;
            remoteVideoTag.muted = false;
        });
    }

    createConnection(): void {
        const localMedia = this.localMediaStream();
        const peerConnection = new RTCPeerConnection();

        if (localMedia) {
            localMedia.getTracks().forEach((track) => peerConnection.addTrack(track, localMedia));

            this.webRtcConnectionService
                .createConnection(peerConnection)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe((remote: WebRtcConnectionDto) => {
                    this.remoteConnection = remote;
                    this.remoteVideo().nativeElement.srcObject = new MediaStream(
                        peerConnection.getReceivers().map(({ track }) => track)
                    );
                });
        }
    }

    closeConnection(): void {
        if (this.remoteConnection) {
            this.webRtcConnectionService
                .closeConnection(this.remoteConnection)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe();
        }
    }
}
