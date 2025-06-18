import { inject, Injectable, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { NAVIGATOR } from '@ng-web-apis/common';
import { from, Observable, tap } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class UserMediaService {
    readonly localMediaStream$: Observable<MediaStream | undefined> = from(
        inject(NAVIGATOR).mediaDevices.getUserMedia({
            audio: true,
            video: true,
        })
    ).pipe(
        tap((stream) => {
            stream.getAudioTracks().forEach((track) => {
                track.enabled = true;
            });
            stream.getVideoTracks().forEach((track) => {
                track.enabled = true;
            });
        })
    );

    readonly localMediaStream: Signal<MediaStream | undefined> = toSignal<MediaStream | undefined>(
        this.localMediaStream$
    );
}
