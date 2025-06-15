import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

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
    readonly srcObject = input<MediaStream>();
    readonly videoState = signal(false);
    readonly audioState = signal(false);

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
