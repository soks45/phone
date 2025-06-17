import { Observable } from 'rxjs';
import { WebSocket } from 'ws';

import { deserializeWsEvent, isThatType, serializeWsEvent, WsEvents, WsMessage } from '@shared/models/ws-event';
import { WsSession } from '@shared/models/ws-session';

export class ServerWsMessage<K extends keyof WsEvents = keyof WsEvents> {
    constructor(
        readonly data: WsMessage<K>['data'],
        readonly userId: number,
        readonly sessionId: string
    ) {}
}

export class ServerWsSession {
    constructor(
        readonly userId: number,
        readonly sessionId: string,
        private readonly ws: WebSocket
    ) {}

    send(message: WsMessage): void {
        this.ws.send(serializeWsEvent(message));
    }

    message<K extends keyof WsEvents>(type: K): Observable<ServerWsMessage<K>> {
        return new Observable((observer) => {
            const onMessage = (rawData: string) => {
                try {
                    const message = deserializeWsEvent(rawData);
                    if (isThatType(type, message)) {
                        observer.next(new ServerWsMessage(message.data, this.userId, this.sessionId));
                    }
                } catch (e) {
                    observer.error(e);
                }
            };
            const onClose = () => {
                observer.complete();
            };

            this.ws.on('message', onMessage);
            this.ws.on('close', onClose);

            return () => {
                this.ws.off('message', onMessage);
                this.ws.off('close', onClose);
            };
        });
    }

    closed(): Observable<{
        userId: number;
        sessionId: string;
    }> {
        return new Observable((observer) => {
            const onClose = () => {
                observer.next({
                    userId: this.userId,
                    sessionId: this.sessionId,
                });
                observer.complete();
            };
            this.ws.on('close', onClose);

            return () => this.ws.off('close', onClose);
        });
    }

    toJSON(): WsSession {
        return {
            sessionId: this.sessionId,
            userId: this.userId,
        };
    }
}
