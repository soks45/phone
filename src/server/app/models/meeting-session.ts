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

    close(): void {
        this.subs.forEach((value) => value.unsubscribe());
        this.wsSessions.clear();
    }

    private observeEvents(peerSession: ServerWsSession): void {
        this.subs.set(
            peerSession,
            new MeetingEventListenerBuilder(peerSession, this.id)
                .on('meetingRTCConnection', (message) => {
                    const newPeerRTCConnection = ConnectionService.getConnection(message.data.connectionId);
                    if (!newPeerRTCConnection) {
                        return;
                    }

                    for (const newPeerSession of this.other(peerSession)) {
                        const peerRTConnection = this.rtcSessions.get(newPeerSession);
                        if (!peerRTConnection) continue;
                        const removeTracksOnCloseWsNewPeer = peerRTConnection.addClientTracksFrom(newPeerRTCConnection);
                        peerSession.closed().subscribe(() => removeTracksOnCloseWsNewPeer());
                        const removeTracksOnCloseWsPeer = newPeerRTCConnection.addClientTracksFrom(peerRTConnection);
                        newPeerSession.closed().subscribe(() => removeTracksOnCloseWsPeer());
                    }

                    this.rtcSessions.set(peerSession, newPeerRTCConnection);
                    this.broadcastMeetingUpgradeRTCConnection();
                })
                .on('meetingPostMessage', async ({ userId, data }) => {
                    try {
                        await MeetingRepository.postMessage(this.id, userId, data.message);
                        this.broadcast({
                            type: 'meetingMessagePosted',
                            data: { meetingId: this.id },
                        });
                    } catch (e) {
                        this.sendTo(peerSession, {
                            type: 'error',
                            data: new AppException('Failed to post message'),
                        });
                    }
                })
                .on('meetingGetPeers', () => {
                    this.sendTo(peerSession, {
                        type: 'meetingPeers',
                        data: { meetingId: this.id, peers: this.peersJSON() },
                    });
                })
                .onClose(() => this.disconnect(peerSession))
                .build()
        );
    }

    private disconnect(session: ServerWsSession): void {
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

    private broadcast(message: WsMessage): void {
        for (let session of this.peers()) {
            this.sendTo(session, message);
        }
    }

    private sendTo(session: ServerWsSession, message: WsMessage): void {
        session.send(message);
    }

    private sendOther(session: ServerWsSession, message: WsMessage): void {
        this.other(session).forEach((currentSession) => {
            this.sendTo(currentSession, message);
        });
    }

    private broadcastMeetingUpgradeRTCConnection(): void {
        this.broadcast({ type: 'meetingUpgradeRTCConnection', data: { meetingId: this.id } });
    }

    private broadcastPeers(): void {
        this.broadcast({
            type: 'meetingPeers',
            data: { meetingId: this.id, peers: this.peersJSON() },
        });
    }

    private other(session: ServerWsSession): ServerWsSession[] {
        return this.peers().filter((currentSession) => session !== currentSession);
    }

    private peers(): ServerWsSession[] {
        return [...this.wsSessions.values()];
    }

    private peersJSON(): WsSession[] {
        return [...this.wsSessions.values()].map((session) => session.toJSON());
    }

    private isEmpty(): boolean {
        return this.wsSessions.size === 0;
    }

    private isConnected(session: ServerWsSession): boolean {
        return this.wsSessions.has(session);
    }
}
