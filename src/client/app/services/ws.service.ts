import { Inject, Injectable } from '@angular/core';

import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

import { WS_TOKEN } from '@client/app/tokens/ws.token';
import { deserializeWsEvent, serializeWsEvent, WsMessage } from '@shared/models/ws-event';

@Injectable()
export abstract class WsService {}

/**
 * Should be available only in browser context
 * */
export class WsClientService extends WsService {
    private readonly _webSocket: WebSocketSubject<WsMessage>;

    constructor(@Inject(WS_TOKEN) url: string) {
        super();

        this._webSocket = webSocket({
            url: url,
            protocol: 'https',
            deserializer: ({ data }: MessageEvent) => deserializeWsEvent(data),
            serializer: serializeWsEvent,
        });
    }
}
