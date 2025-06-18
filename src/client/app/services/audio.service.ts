import { Injectable, Renderer2 } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class AudioService {
    private readonly audio: HTMLAudioElement;

    constructor(private readonly renderer2: Renderer2) {
        this.audio = this.renderer2.createElement('audio');
    }
}
