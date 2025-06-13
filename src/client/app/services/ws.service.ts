import { Inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { webSocket } from 'rxjs/webSocket';

import { WS_TOKEN } from '@client/app/tokens/ws.token';
import { deserializeWsEvent, serializeWsEvent, WsMessage } from '@shared/models/ws-event';

@Injectable()
export abstract class WsService {
    abstract provideConnection(route: string): Observable<WsMessage>;
}

/**
 * Should be available only in browser context
 * */
@Injectable()
export class WsClientService extends WsService {
    constructor(@Inject(WS_TOKEN) private readonly url: string) {
        super();
    }

    provideConnection(route: string): Observable<WsMessage> {
        return webSocket({
            url: `${this.url}/${route}`,
            protocol: 'https',
            deserializer: ({ data }: MessageEvent) => deserializeWsEvent(data),
            serializer: serializeWsEvent,
        });
    }
}
