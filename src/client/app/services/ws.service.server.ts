import { Injectable } from '@angular/core';

import { ShouldNotBeUsedDuringSsrException } from '@client/app/exceptions/should-not-be-used-during-ssr.exception';
import { WsService } from '@client/services/ws.service';
import { WsMessage, WsEvents } from '@shared/models/ws-event';

/**
 * Stub for SSR
 * */
@Injectable()
export class WsServiceServer extends WsService {
    disconnected(): never {
        throw new ShouldNotBeUsedDuringSsrException('WsService');
    }
    messages(): never {
        throw new ShouldNotBeUsedDuringSsrException('WsService');
    }
    send(message: WsMessage<keyof WsEvents>): never {
        throw new ShouldNotBeUsedDuringSsrException('WsService');
    }
}
