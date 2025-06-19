import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';

import { tuiIsPresent } from '@taiga-ui/cdk';
import { firstValueFrom, from, map, Observable, switchMap, takeWhile } from 'rxjs';

import { RtcConnection } from '@client/app/models/rtc-connection';
import { API_TOKEN } from '@client/app/tokens/api.token';
import { UserMediaService } from '@client/services/user-media.service';
import { WebRtcConnectionDto } from '@shared/models/web-rtc-connection.dto';

@Injectable()
export abstract class WebRtcConnectionService {
    abstract initializeRTCPeerConnection(): Observable<RtcConnection>;
    abstract upgradeRTCPeerConnection(connection: RtcConnection): Observable<RtcConnection>;
    abstract closeRTCPeerConnection(connectionId: string): Observable<WebRtcConnectionDto>;
}

/**
 * Should be available only in browser context
 * */
@Injectable()
export class WebRtcBrowserConnectionService extends WebRtcConnectionService {
    constructor(
        private readonly http: HttpClient,
        @Inject(API_TOKEN)
        private readonly api: string,
        private readonly userMediaService: UserMediaService
    ) {
        super();
    }

    initializeRTCPeerConnection(): Observable<RtcConnection> {
        return this.userMediaService.localMediaStream$.pipe(
            takeWhile(tuiIsPresent),
            map((localMedia: MediaStream) => this.createRTCPeerConnection(localMedia)),
            switchMap((peerConnection: RTCPeerConnection) =>
                this.createConnection(peerConnection).pipe(
                    map((dto: WebRtcConnectionDto) => new RtcConnection(peerConnection, dto))
                )
            )
        );
    }

    upgradeRTCPeerConnection(existingConnection: RtcConnection): Observable<RtcConnection> {
        return from(this.upgradeCurrentConnectionToServer(existingConnection)).pipe(
            map((dto: WebRtcConnectionDto) => new RtcConnection(existingConnection.peerConnection, dto))
        );
    }

    private createRTCPeerConnection(localMedia: MediaStream): RTCPeerConnection {
        const peerConnection = new RTCPeerConnection();
        localMedia.getTracks().forEach((track) => peerConnection.addTrack(track, localMedia));
        return peerConnection;
    }

    private createConnection(localPeerConnection: RTCPeerConnection): Observable<WebRtcConnectionDto> {
        return from(this.connectToServer(localPeerConnection));
    }

    private async connectToServer(localPeerConnection: RTCPeerConnection): Promise<WebRtcConnectionDto> {
        const remotePeerConnection: WebRtcConnectionDto = await this.createConnectionToServer();
        await this.sdpHandshake(localPeerConnection, remotePeerConnection);
        return remotePeerConnection;
    }

    private async upgradeCurrentConnectionToServer(connectionStreams: RtcConnection): Promise<WebRtcConnectionDto> {
        const remotePeerConnection: WebRtcConnectionDto = await this.upgradeConnectionToServer(
            connectionStreams.remoteConnection
        );
        await this.sdpHandshake(connectionStreams.peerConnection, remotePeerConnection);
        return remotePeerConnection;
    }

    private async sdpHandshake(
        localPeerConnection: RTCPeerConnection,
        remotePeerConnection: WebRtcConnectionDto
    ): Promise<void> {
        await localPeerConnection.setRemoteDescription(remotePeerConnection.localDescription);
        const originalAnswer = await localPeerConnection.createAnswer();
        const updatedAnswer = new RTCSessionDescription({
            type: 'answer',
            sdp: originalAnswer.sdp,
        });
        await localPeerConnection.setLocalDescription(updatedAnswer);
        await this.setRemoteDescription(localPeerConnection, remotePeerConnection);
    }

    private createConnectionToServer(): Promise<WebRtcConnectionDto> {
        return firstValueFrom(this.http.post<WebRtcConnectionDto>(`${this.api}/connection`, {}));
    }

    private upgradeConnectionToServer(oldConnection: WebRtcConnectionDto): Promise<WebRtcConnectionDto> {
        return firstValueFrom(this.http.put<WebRtcConnectionDto>(`${this.api}/connection/${oldConnection.id}`, {}));
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

    closeRTCPeerConnection(connectionId: string): Observable<WebRtcConnectionDto> {
        return this.http.delete<WebRtcConnectionDto>(`${this.api}/connection/${connectionId}`);
    }

    getRTCPeerConnection(connectionId: string): Observable<WebRtcConnectionDto> {
        return this.http.get<WebRtcConnectionDto>(`${this.api}/connection/${connectionId}`);
    }
}
