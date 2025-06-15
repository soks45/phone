import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    ChangeDetectionStrategy,
    Component,
    effect,
    ElementRef,
    input,
    Signal,
    signal,
    viewChild,
} from '@angular/core';

import { TuiButtonModule } from '@taiga-ui/core';

@Component({
    selector: 'app-video',
    standalone: true,
    imports: [TuiButtonModule],
    templateUrl: './video.component.html',
    styleUrl: './video.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoComponent {
    private readonly video: Signal<ElementRef<HTMLVideoElement>> =
        viewChild.required<ElementRef<HTMLVideoElement>>('video');

    readonly srcObject = input<MediaStream>();
    readonly controls = input(false, {
        transform: coerceBooleanProperty,
    });

    readonly videoState = signal(true);
    readonly audioState = signal(true);

    constructor() {
        effect(
            () => {
                const localMedia = this.srcObject();
                const videoTag = this.video().nativeElement;
                if (localMedia) {
                    videoTag.srcObject = localMedia;
                    videoTag.autoplay = true;
                    this.audioState.set(!!localMedia.getAudioTracks()[0]?.enabled);
                    this.videoState.set(!!localMedia.getVideoTracks()[0]?.enabled);
                }
            },
            { allowSignalWrites: true }
        );
    }

    toggleVideo(): void {
        const videoTrack = this.srcObject()?.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            this.videoState.set(videoTrack.enabled);
        }
    }

    toggleAudio(): void {
        const audioTrack = this.srcObject()?.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            this.audioState.set(audioTrack.enabled);
        }
    }
}
