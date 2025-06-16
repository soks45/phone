import { Observable } from 'rxjs';
import { WebSocket } from 'ws';

import { WsConnection } from '@shared/models/ws-connection';
import { deserializeWsEvent, serializeWsEvent, WsMessage } from '@shared/models/ws-event';

export class ServerWsConnection implements WsConnection {
    constructor(
        private readonly userId: number,
        private readonly ws: WebSocket
    ) {}

    send(message: WsMessage): void {
        this.ws.send(serializeWsEvent(message));
    }

    messages(): Observable<WsMessage> {
        return new Observable((observer) => {
            const onMessage = (rawData: string) => {
                try {
                    const message = deserializeWsEvent(rawData);
                    observer.next(message);
                } catch (e) {
                    observer.error(e);
                }
            };
            this.ws.on('message', onMessage);

            return () => this.ws.off('message', onMessage);
        });
    }

    disconnected(): Observable<void> {
        return new Observable((observer) => {
            const onClose = () => {
                observer.next();
                observer.complete();
            };
            this.ws.on('close', onClose);

            return () => this.ws.off('close', onClose);
        });
    }
}
