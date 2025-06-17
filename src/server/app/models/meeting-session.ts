import { filter, Subscription } from 'rxjs';

import { ServerWsSession } from '@server/app/models/server-ws-session';
import { WsMessage } from '@shared/models/ws-event';
import { WsSession } from '@shared/models/ws-session';

export class MeetingSession {
    private readonly sessions = new Set<ServerWsSession>();
    private readonly sub: Subscription = new Subscription();

    constructor(readonly id: string) {}

    destroy(): void {
        this.sub.unsubscribe();
        this.sessions.clear();
    }

    connect(session: ServerWsSession): void {
        if (this.isConnected(session)) {
            this.sendTo(session, { type: 'meetingConnected', data: { meetingId: this.id } });
            return;
        }

        this.sessions.add(session);
        this.sub.add(session.closed().subscribe(() => this.disconnect(session)));
        this.sub.add(
            session
                .message('meetingGetPeers')
                .pipe(filter((msg) => msg.payload.data.meetingId === this.id))
                .subscribe(() =>
                    this.sendTo(session, {
                        type: 'meetingPeers',
                        data: { meetingId: this.id, peers: this.peersJSON() },
                    })
                )
        );

        this.sendTo(session, { type: 'meetingConnected', data: { meetingId: this.id } });
        this.sendOther(session, { type: 'meetingJoined', data: { meetingId: this.id, userId: session.userId } });
        this.broadcastPeers();
    }

    disconnect(session: ServerWsSession): void {
        this.sendTo(session, { type: 'meetingDisconnected', data: { meetingId: this.id } });
        this.sessions.delete(session);
        this.broadcast({ type: 'meetingLeft', data: { meetingId: this.id, userId: session.userId } });
        this.broadcastPeers();
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
