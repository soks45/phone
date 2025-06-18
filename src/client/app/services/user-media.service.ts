import { inject, Injectable, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { NAVIGATOR } from '@ng-web-apis/common';
import { tuiIsPresent } from '@taiga-ui/cdk';
import { filter, from, map, Observable, shareReplay, switchMap, tap } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class UserMediaService {
    readonly localMediaStream$: Observable<MediaStream> = from(
        inject(NAVIGATOR).mediaDevices.getUserMedia({
            audio: true,
            video: true,
        })
    ).pipe(
        filter(tuiIsPresent),
        shareReplay({
            bufferSize: 1,
            refCount: true,
        })
    );

    private readonly microphoneTrack$: Observable<MediaStreamTrack> = this.localMediaStream$.pipe(
        map((stream) => stream.getAudioTracks()[0]),
        filter(tuiIsPresent),
        shareReplay({
            bufferSize: 1,
            refCount: true,
        })
    );

    private readonly cameraTrack$: Observable<MediaStreamTrack> = this.localMediaStream$.pipe(
        map((stream) => stream.getVideoTracks()[0]),
        filter(tuiIsPresent),
        shareReplay({
            bufferSize: 1,
            refCount: true,
        })
    );

    readonly microphoneMuted$: Observable<boolean> = this.microphoneTrack$.pipe(
        switchMap(
            (track) =>
                new Observable<boolean>((observer) => {
                    const update = () => observer.next(!track.enabled);
                    track.addEventListener('mute', update);
                    track.addEventListener('unmute', update);
                    update();

                    return () => {
                        track.removeEventListener('mute', update);
                        track.removeEventListener('unmute', update);
                    };
                })
        )
    );

    readonly cameraMuted$: Observable<boolean> = this.cameraTrack$.pipe(
        switchMap(
            (track) =>
                new Observable<boolean>((observer) => {
                    const update = () => observer.next(!track.enabled);
                    track.addEventListener('mute', update);
                    track.addEventListener('unmute', update);
                    update();

                    return () => {
                        track.removeEventListener('mute', update);
                        track.removeEventListener('unmute', update);
                    };
                })
        )
    );

    readonly localMediaStream: Signal<MediaStream | undefined> = toSignal<MediaStream | undefined>(
        this.localMediaStream$
    );

    toggleMicrophone(): Observable<MediaStreamTrack> {
        return this.microphoneTrack$.pipe(
            tap((track: MediaStreamTrack) => {
                track.enabled = !track.enabled;
                const event = new Event(track.enabled ? 'unmute' : 'mute');
                track.dispatchEvent(event);
            })
        );
    }

    toggleCamera(): Observable<MediaStreamTrack> {
        return this.cameraTrack$.pipe(
            tap((track: MediaStreamTrack) => {
                track.enabled = !track.enabled;
                const event = new Event(track.enabled ? 'unmute' : 'mute');
                track.dispatchEvent(event);
            })
        );
    }
}
