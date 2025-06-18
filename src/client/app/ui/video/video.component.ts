import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    ChangeDetectionStrategy,
    Component,
    effect,
    ElementRef,
    input,
    output,
    Signal,
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

    readonly controls = input(false, {
        transform: coerceBooleanProperty,
    });

    readonly srcObject = input<MediaStream>();
    readonly audioMuted = input<boolean>(false);
    readonly videoMuted = input<boolean>(false);

    readonly toggleVideo = output<void>();
    readonly toggleAudio = output<void>();

    constructor() {
        effect(() => {
            const localMedia = this.srcObject();
            const videoTag = this.video().nativeElement;
            if (localMedia) {
                videoTag.srcObject = localMedia;
                videoTag.autoplay = true;
            }
        });
    }
}
