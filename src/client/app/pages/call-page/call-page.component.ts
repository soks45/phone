import { ChangeDetectionStrategy, Component, DestroyRef, inject, Signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

import { NAVIGATOR } from '@ng-web-apis/common';
import { TuiButtonModule, TuiLinkModule } from '@taiga-ui/core';
import { from } from 'rxjs';

import { HeaderComponent } from '@client/app/ui/header/header.component';

@Component({
    selector: 'app-call-page',
    standalone: true,
    imports: [HeaderComponent, RouterLink, TuiButtonModule, TuiLinkModule],
    templateUrl: './call-page.component.html',
    styleUrl: './call-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CallPageComponent {
    private readonly localVideo: Signal<HTMLVideoElement> = viewChild.required<HTMLVideoElement>('localVideo');
    private readonly remoteVideo: Signal<HTMLVideoElement> = viewChild.required<HTMLVideoElement>('remoteVideo');
    private readonly navigator: Navigator = inject(NAVIGATOR);
    private readonly destroyRef: DestroyRef = inject(DestroyRef);
    private readonly localMediaStream: Signal<MediaStream | undefined> = toSignal<MediaStream>(
        from(
            this.navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true,
            })
        )
    );
}
