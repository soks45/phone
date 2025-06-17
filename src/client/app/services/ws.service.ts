import { Inject, Injectable } from '@angular/core';

import { BehaviorSubject, EMPTY, filter, map, Observable, of, shareReplay, switchMap, take } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

import { WS_TOKEN } from '@client/app/tokens/ws.token';
import { AuthService } from '@client/services/auth.service';
import { deserializeWsEvent, isThatType, serializeWsEvent, WsEvents, WsMessage } from '@shared/models/ws-event';

@Injectable()
export abstract class WsService {
    abstract disconnected(): Observable<void>;
    abstract messages(): Observable<WsMessage>;
    abstract ofType<K extends keyof WsEvents>(type: K): Observable<WsMessage<K>>;
    abstract send(message: WsMessage): void;
}

/**
 * Should be available only in browser context
 * */
@Injectable()
export class WsClientService {
    private readonly webSocketSubject: WebSocketSubject<WsMessage> = webSocket({
        url: `${this.url}`,
        protocol: 'https',
        deserializer: ({ data }: MessageEvent) => deserializeWsEvent(data),
        serializer: serializeWsEvent,
        closeObserver: {
            next: () => {
                this.opened$.next(false);
            },
        },
        openObserver: {
            next: () => {
                this.opened$.next(true);
            },
        },
    });

    private readonly opened$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private readonly ready$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    private connection?: Observable<WsMessage>;

    constructor(
        @Inject(WS_TOKEN)
        private readonly url: string,
        private readonly auth: AuthService
    ) {
        this.ofType('wsReady').subscribe(({ data }) => {
            this.ready$.next(data);
        });
    }

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
                    refCount: false,
                })
            );
        }

        return this.connection;
    }

    ofType<K extends keyof WsEvents>(type: K): Observable<WsMessage<K>> {
        return this.messages().pipe(
            filter((wsMessage: WsMessage): wsMessage is WsMessage<K> => isThatType(type, wsMessage))
        );
    }

    /** There is some time to check auth on back so we need to get some stable call */
    send(message: WsMessage): void {
        this.ready()
            .pipe(filter(Boolean), take(1))
            .subscribe(() => {
                this.webSocketSubject.next(message);
            });
    }

    ready(): Observable<boolean> {
        return this.opened$.pipe(
            switchMap((opened) => (opened ? this.ofType('wsReady').pipe(map(({ data }) => data)) : of(false)))
        );
    }

    disconnected(): Observable<void> {
        return this.opened$.pipe(
            filter((v) => !v),
            map(() => {})
        );
    }
}
