import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';

import { firstValueFrom, from, Observable } from 'rxjs';

import { API_TOKEN } from '@client/app/tokens/api.token';
import { WebRtcConnectionDto } from '@shared/models/web-rtc-connection.dto';

@Injectable()
export abstract class WebRtcConnectionService {
    abstract createConnection(localPeerConnection: RTCPeerConnection): Observable<WebRtcConnectionDto>;
    abstract closeConnection(remotePeerConnectionDto: WebRtcConnectionDto): Observable<WebRtcConnectionDto>;
}

/**
 * Should be available only in browser context
 * */
export class WebRtcBrowserConnectionService extends WebRtcConnectionService {
    constructor(
        private readonly http: HttpClient,
        @Inject(API_TOKEN)
        private readonly api: string
    ) {
        super();
    }

    createConnection(localPeerConnection: RTCPeerConnection): Observable<WebRtcConnectionDto> {
        return from(this.connectToServer(localPeerConnection));
    }

    closeConnection(remotePeerConnectionDto: WebRtcConnectionDto): Observable<WebRtcConnectionDto> {
        return this.http.delete<WebRtcConnectionDto>(`${this.api}/connection/${remotePeerConnectionDto.id}`);
    }

    private async connectToServer(localPeerConnection: RTCPeerConnection): Promise<WebRtcConnectionDto> {
        const remotePeerConnection: WebRtcConnectionDto = await this.createConnectionToServer();
        await localPeerConnection.setRemoteDescription(remotePeerConnection.localDescription);
        const originalAnswer = await localPeerConnection.createAnswer();
        const updatedAnswer = new RTCSessionDescription({
            type: 'answer',
            sdp: originalAnswer.sdp,
        });
        await localPeerConnection.setLocalDescription(updatedAnswer);
        await this.setRemoteDescription(localPeerConnection, remotePeerConnection);

        return remotePeerConnection;
    }

    private createConnectionToServer(): Promise<WebRtcConnectionDto> {
        return firstValueFrom(this.http.post<WebRtcConnectionDto>(`${this.api}/connection`, {}));
    }

    private setRemoteDescription(
        localPeerConnection: RTCPeerConnection,
        remotePeerConnection: WebRtcConnectionDto
    ): Promise<string> {
        return firstValueFrom(
            this.http.post<string>(
                `${this.api}/connection/${remotePeerConnection.id}/remote-description`,
                localPeerConnection.localDescription
            )
        );
    }
}
