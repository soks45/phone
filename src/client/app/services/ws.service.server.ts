import { Injectable } from '@angular/core';

import { ShouldNotBeUsedDuringSsrException } from '@client/app/exceptions/should-not-be-used-during-ssr.exception';
import { WsService } from '@client/services/ws.service';

/**
 * Stub for SSR
 * */
@Injectable()
export class WsServiceServer extends WsService {
    provideConnection(): never {
        throw new ShouldNotBeUsedDuringSsrException('WsServiceServer');
    }
}
