import { Inject, Injectable } from '@angular/core';

import { EMPTY, Observable, shareReplay, Subject, switchMap } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

import { WS_TOKEN } from '@client/app/tokens/ws.token';
import { AuthService } from '@client/services/auth.service';
import { WsConnection } from '@shared/models/ws-connection';
import { deserializeWsEvent, serializeWsEvent, WsMessage } from '@shared/models/ws-event';

@Injectable()
export abstract class WsService implements WsConnection {
    abstract disconnected(): Observable<void>;
    abstract messages(): Observable<WsMessage>;
    abstract send(message: WsMessage): void;
}

/**
 * Should be available only in browser context
 * */
@Injectable()
export class WsClientService implements WsConnection {
    private readonly webSocketSubject: WebSocketSubject<WsMessage> = webSocket({
        url: `${this.url}`,
        protocol: 'https',
        deserializer: ({ data }: MessageEvent) => deserializeWsEvent(data),
        serializer: serializeWsEvent,
        closeObserver: {
            next: () => {
                this.close$.next();
            },
        },
    });

    private readonly close$ = new Subject<void>();

    private connection?: Observable<WsMessage>;

    constructor(
        @Inject(WS_TOKEN) private readonly url: string,
        private readonly auth: AuthService
    ) {}

    messages(): Observable<WsMessage> {
        if (!this.connection) {
            this.connection = this.auth.isAuthed$.pipe(
                switchMap((isAuthed) => {
                    if (isAuthed) {
                        return this.webSocketSubject as Observable<WsMessage>;
                    } else {
                        return EMPTY;
                    }
                }),
                shareReplay({
                    bufferSize: 1,
                    refCount: true,
                })
            );
        }

        return this.connection;
    }

    send(message: WsMessage): void {
        this.webSocketSubject?.next(message);
    }

    disconnected(): Observable<void> {
        return this.close$;
    }
}
