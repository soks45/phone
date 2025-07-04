import { noop } from 'rxjs';
import wrtc from 'wrtc';

import { BaseConnection } from '@server/app/models/base-connection';
import { AppException } from '@shared/exceptions/app.exception';
import { WebRtcConnectionDto } from '@shared/models/web-rtc-connection.dto';

export class WebRtcConnectionServer extends BaseConnection {
    private readonly TIME_TO_CONNECTED = 10000;
    private readonly TIME_TO_HOST_CANDIDATES = 3000;
    private readonly TIME_TO_RECONNECTED = 10000;

    private connectionTimer?: NodeJS.Timeout;
    private reconnectionTimer?: NodeJS.Timeout;

    private readonly onIceConnectionStateChange: VoidFunction = () => {
        if (
            this.peerConnection.iceConnectionState === 'connected' ||
            this.peerConnection.iceConnectionState === 'completed'
        ) {
            if (this.connectionTimer) {
                clearTimeout(this.connectionTimer);
                this.connectionTimer = undefined;
            }
            clearTimeout(this.reconnectionTimer);
            this.reconnectionTimer = undefined;
        } else if (
            this.peerConnection.iceConnectionState === 'disconnected' ||
            this.peerConnection.iceConnectionState === 'failed'
        ) {
            if (!this.connectionTimer && !this.reconnectionTimer) {
                this.reconnectionTimer = setTimeout(() => {
                    this.close();
                }, this.TIME_TO_RECONNECTED);
            }
        }
    };

    readonly peerConnection: RTCPeerConnection = new wrtc.RTCPeerConnection({
        sdpSemantics: 'unified-plan',
    });

    constructor(id: string) {
        super(id);

        this.startConnectionTimout();
        this.peerConnection.addEventListener('iceconnectionstatechange', this.onIceConnectionStateChange);
    }

    private startConnectionTimout(): void {
        this.connectionTimer = setTimeout(() => {
            if (
                this.peerConnection.iceConnectionState !== 'connected' &&
                this.peerConnection.iceConnectionState !== 'completed'
            ) {
                this.close();
            }
        }, this.TIME_TO_CONNECTED);
    }

    async doOffer(): Promise<void> {
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);
        try {
            await this.waitUntilIceGatheringStateComplete();
        } catch (error) {
            this.close();
            throw error;
        }
    }

    async addClientTracks(): Promise<void> {
        const audioTransceiver = this.peerConnection.addTransceiver('audio');
        const videoTransceiver = this.peerConnection.addTransceiver('video');
        await Promise.all([
            audioTransceiver.sender.replaceTrack(audioTransceiver.receiver.track),
            videoTransceiver.sender.replaceTrack(videoTransceiver.receiver.track),
        ]);
    }

    addClientTracksFrom(addTracksFrom: WebRtcConnectionServer): () => void {
        const audioTrack = addTracksFrom.peerConnection
            .getTransceivers()
            .map(({ sender }) => sender?.track)
            .find((track) => track?.kind === 'audio');

        const videoTrack = addTracksFrom.peerConnection
            .getTransceivers()
            .map(({ sender }) => sender?.track)
            .find((track) => track?.kind === 'video');

        if (!audioTrack || !videoTrack) {
            return noop;
        }

        let audioTransceiver: RTCRtpTransceiver | null = this.peerConnection.addTransceiver(audioTrack);
        let videoTransceiver: RTCRtpTransceiver | null = this.peerConnection.addTransceiver(videoTrack);

        return () => {
            try {
                if (audioTransceiver && videoTransceiver) {
                    audioTransceiver.stop();
                    videoTransceiver.stop();
                }

                audioTransceiver = null;
                videoTransceiver = null;
            } catch (e) {
                console.error(e);
            }
        };
    }

    private async waitUntilIceGatheringStateComplete(): Promise<void> {
        if (this.peerConnection.iceGatheringState === 'complete') {
            return;
        }

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.peerConnection.removeEventListener('icecandidate', onIceCandidate);
                reject(new AppException('Timed out waiting for host candidates'));
            }, this.TIME_TO_HOST_CANDIDATES);

            const onIceCandidate = ({ candidate }: { candidate: any }) => {
                if (!candidate) {
                    clearTimeout(timeout);
                    this.peerConnection.removeEventListener('icecandidate', onIceCandidate);
                    resolve();
                }
            };

            this.peerConnection.addEventListener('icecandidate', onIceCandidate);
        });
    }

    async applyAnswer(answer: any): Promise<void> {
        await this.peerConnection.setRemoteDescription(answer);
    }

    override close(): void {
        this.peerConnection.removeEventListener('iceconnectionstatechange', this.onIceConnectionStateChange);
        if (this.connectionTimer) {
            clearTimeout(this.connectionTimer);
            this.connectionTimer = undefined;
        }
        if (this.reconnectionTimer) {
            clearTimeout(this.reconnectionTimer);
            this.reconnectionTimer;
        }
        this.peerConnection.close();
        super.close();
    }

    override toJSON(): WebRtcConnectionDto {
        return {
            ...super.toJSON(),
            iceConnectionState: this.iceConnectionState,
            localDescription: this.localDescription,
            remoteDescription: this.remoteDescription,
            signalingState: this.signalingState,
        };
    }

    get iceConnectionState() {
        return this.peerConnection.iceConnectionState;
    }

    get localDescription() {
        return this.descriptionToJSON(this.peerConnection.localDescription, true);
    }

    get remoteDescription() {
        return this.descriptionToJSON(this.peerConnection.remoteDescription, true);
    }

    get signalingState() {
        return this.peerConnection.signalingState;
    }

    private descriptionToJSON(description: any, shouldDisableTrickleIce: any) {
        return !description
            ? {}
            : {
                  type: description.type,
                  sdp: shouldDisableTrickleIce ? this.disableTrickleIce(description.sdp) : description.sdp,
              };
    }

    private disableTrickleIce(sdp: any) {
        return sdp.replace(/\r\na=ice-options:trickle/g, '');
    }
}
