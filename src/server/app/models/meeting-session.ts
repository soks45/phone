import { Subscription } from 'rxjs';

import { MeetingEventListenerBuilder } from '@server/app/models/meeting-session-event-listener-builder';
import { ServerWsSession } from '@server/app/models/server-ws-session';
import { WebRtcConnectionServer } from '@server/app/models/web-rtc-connection.server';
import { MeetingRepository } from '@server/repositories/meeting.repository';
import { ConnectionService } from '@server/services/connection.service';
import { AppException } from '@shared/exceptions/app.exception';
import { WsMessage } from '@shared/models/ws-event';
import { WsSession } from '@shared/models/ws-session';

export class MeetingSession {
    private readonly wsSessions = new Set<ServerWsSession>();
    private readonly rtcSessions: Map<ServerWsSession, WebRtcConnectionServer> = new Map<
        ServerWsSession,
        WebRtcConnectionServer
    >();
    private readonly subs: Map<ServerWsSession, Subscription> = new Map<ServerWsSession, Subscription>();

    constructor(readonly id: string) {}

    connect(session: ServerWsSession): void {
        if (this.isConnected(session)) {
            this.sendTo(session, { type: 'meetingConnected', data: { meetingId: this.id } });
            return;
        }

        this.wsSessions.add(session);
        this.observeEvents(session);

        this.sendTo(session, { type: 'meetingConnected', data: { meetingId: this.id } });
        this.sendOther(session, { type: 'meetingJoined', data: { meetingId: this.id, userId: session.userId } });
        this.broadcastPeers();
    }

    private observeEvents(session: ServerWsSession): void {
        this.subs.set(
            session,
            new MeetingEventListenerBuilder(session, this.id)
                .on('meetingPostMessage', async ({ userId, data }) => {
                    try {
                        const message = await MeetingRepository.postMessage(this.id, userId, data.message);
                        this.broadcast({
                            type: 'meetingMessagePosted',
                            data: { meetingId: this.id, message },
                        });
                    } catch (e) {
                        this.sendTo(session, {
                            type: 'error',
                            data: new AppException('Failed to post message'),
                        });
                    }
                })
                .on('meetingGetPeers', () =>
                    this.sendTo(session, {
                        type: 'meetingPeers',
                        data: { meetingId: this.id, peers: this.peersJSON() },
                    })
                )
                .on('meetingRTCConnection', async (message) => {
                    const newRTCConnection = ConnectionService.getConnection(message.data.connectionId);
                    if (!newRTCConnection) {
                        return;
                    }

                    for (const peerSession of this.other(session)) {
                        const peerRTConnection = this.rtcSessions.get(peerSession);
                        if (!peerRTConnection) continue;
                        await this.addMediaP2P(peerRTConnection, newRTCConnection, session);
                        await this.addMediaP2P(newRTCConnection, peerRTConnection, session);
                    }

                    this.rtcSessions.set(session, newRTCConnection);
                    this.broadcastMeetingUpgradeRTCConnection();
                })
                .on('meetingGetRTCConnectionMetadata', () => {
                    const rtcConnection: WebRtcConnectionServer | undefined = this.rtcSessions.get(session);
                    if (!rtcConnection) {
                        return;
                    }

                    this.sendTo(session, {
                        type: 'meetingRTCConnectionMetadata',
                        data: { meetingId: this.id, metadata: rtcConnection.transceiversMetadata() },
                    });
                })
                .onClose(() => this.disconnect(session))
                .build()
        );
    }

    disconnect(session: ServerWsSession): void {
        this.wsSessions.delete(session);
        this.rtcSessions.get(session)?.close();
        this.rtcSessions.delete(session);
        this.stopObservingEvents(session);
        this.sendTo(session, { type: 'meetingDisconnected', data: { meetingId: this.id } });
        this.broadcast({ type: 'meetingLeft', data: { meetingId: this.id, userId: session.userId } });
        this.broadcastMeetingUpgradeRTCConnection();
        this.broadcastPeers();
    }

    private stopObservingEvents(session: ServerWsSession): void {
        this.subs.get(session)?.unsubscribe();
        this.subs.delete(session);
    }

    private async addMediaP2P(
        sender: WebRtcConnectionServer,
        receiver: WebRtcConnectionServer,
        session: ServerWsSession
    ): Promise<void> {
        const audioTrack = sender.peerConnection
            .getTransceivers()
            .map(({ sender }) => sender?.track)
            .find((track) => track?.kind === 'audio');

        const videoTrack = sender.peerConnection
            .getTransceivers()
            .map(({ sender }) => sender?.track)
            .find((track) => track?.kind === 'video');

        if (!audioTrack || !videoTrack) {
            return;
        }

        const audioTransceiver = receiver.peerConnection.addTransceiver(audioTrack);
        const videoTransceiver = receiver.peerConnection.addTransceiver(videoTrack);

        session.closed().subscribe(() => {
            audioTransceiver.stop();
            videoTransceiver.stop();
        });
    }

    destroy(): void {
        this.subs.forEach((value) => value.unsubscribe());
        this.wsSessions.clear();
    }

    broadcast(message: WsMessage): void {
        for (let session of this.peers()) {
            this.sendTo(session, message);
        }
    }

    sendTo(session: ServerWsSession, message: WsMessage): void {
        session.send(message);
    }

    sendOther(session: ServerWsSession, message: WsMessage): void {
        this.other(session).forEach((currentSession) => {
            this.sendTo(currentSession, message);
        });
    }

    broadcastMeetingUpgradeRTCConnection(): void {
        this.broadcast({ type: 'meetingUpgradeRTCConnection', data: { meetingId: this.id } });
    }

    broadcastPeers(): void {
        this.broadcast({
            type: 'meetingPeers',
            data: { meetingId: this.id, peers: this.peersJSON() },
        });
    }

    other(session: ServerWsSession): ServerWsSession[] {
        return this.peers().filter((currentSession) => session !== currentSession);
    }

    peers(): ServerWsSession[] {
        return [...this.wsSessions.values()];
    }

    peersJSON(): WsSession[] {
        return [...this.wsSessions.values()].map((session) => session.toJSON());
    }

    isEmpty(): boolean {
        return this.wsSessions.size === 0;
    }

    isConnected(session: ServerWsSession): boolean {
        return this.wsSessions.has(session);
    }
}
