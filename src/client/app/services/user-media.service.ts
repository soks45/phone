import { inject, Injectable, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { NAVIGATOR } from '@ng-web-apis/common';
import { from, tap } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class UserMediaService {
    readonly localMediaStream: Signal<MediaStream | undefined> = toSignal(
        from(
            inject(NAVIGATOR).mediaDevices.getUserMedia({
                audio: true,
                video: true,
            })
        ).pipe(
            tap((stream) => {
                stream.getAudioTracks().forEach((track) => (track.enabled = false));
                stream.getVideoTracks().forEach((track) => (track.enabled = false));
            })
        )
    );
}
