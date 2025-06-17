import { Subscription } from 'rxjs';

import { MeetingEventListenerBuilder } from '@server/app/models/meeting-session-event-listener-builder';
import { ServerWsSession } from '@server/app/models/server-ws-session';
import { MeetingRepository } from '@server/repositories/meeting.repository';
import { AppException } from '@shared/exceptions/app.exception';
import { WsMessage } from '@shared/models/ws-event';
import { WsSession } from '@shared/models/ws-session';

export class MeetingSession {
    private readonly sessions = new Set<ServerWsSession>();
    private readonly subs: Map<ServerWsSession, Subscription> = new Map<ServerWsSession, Subscription>();

    constructor(readonly id: string) {}

    connect(session: ServerWsSession): void {
        if (this.isConnected(session)) {
            this.sendTo(session, { type: 'meetingConnected', data: { meetingId: this.id } });
            return;
        }

        this.sessions.add(session);
        this.observeEvents(session);

        this.sendTo(session, { type: 'meetingConnected', data: { meetingId: this.id } });
        this.sendOther(session, { type: 'meetingJoined', data: { meetingId: this.id, userId: session.userId } });
        this.broadcastPeers();
    }

    private observeEvents(session: ServerWsSession): void {
        this.subs.set(
            session,
            new MeetingEventListenerBuilder(session, this.id)
                .on('meetingPostMessage', async ({ sessionId, userId, data }) => {
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
                .onClose(() => this.disconnect(session))
                .build()
        );
    }

    disconnect(session: ServerWsSession): void {
        this.sendTo(session, { type: 'meetingDisconnected', data: { meetingId: this.id } });
        this.sessions.delete(session);
        this.stopObservingEvents(session);
        this.broadcast({ type: 'meetingLeft', data: { meetingId: this.id, userId: session.userId } });
        this.broadcastPeers();
    }

    private stopObservingEvents(session: ServerWsSession): void {
        this.subs.get(session)?.unsubscribe();
        this.subs.delete(session);
    }

    destroy(): void {
        this.subs.forEach((value) => value.unsubscribe());
        this.sessions.clear();
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
        this.peers()
            .filter((currentSession) => session !== currentSession)
            .forEach((currentSession) => {
                this.sendTo(currentSession, message);
            });
    }

    broadcastPeers(): void {
        this.broadcast({
            type: 'meetingPeers',
            data: { meetingId: this.id, peers: this.peersJSON() },
        });
    }

    peers(): ServerWsSession[] {
        return [...this.sessions.values()];
    }

    peersJSON(): WsSession[] {
        return [...this.sessions.values()].map((session) => session.toJSON());
    }

    isEmpty(): boolean {
        return this.sessions.size === 0;
    }

    isConnected(session: ServerWsSession): boolean {
        return this.sessions.has(session);
    }
}
