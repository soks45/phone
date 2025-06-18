import { Injectable } from '@angular/core';

import { ShouldNotBeUsedDuringSsrException } from '@client/app/exceptions/should-not-be-used-during-ssr.exception';
import { WebRtcConnectionService } from '@client/services/web-rtc-connection.service';

/**
 * Stub for SSR
 * */
@Injectable()
export class WebRtcServerConnectionService extends WebRtcConnectionService {
    constructor() {
        super();
    }

    override upgradeRTCPeerConnection(): never {
        throw new ShouldNotBeUsedDuringSsrException('WebRtcConnectionService');
    }

    initializeRTCPeerConnection(): never {
        throw new ShouldNotBeUsedDuringSsrException('WebRtcConnectionService');
    }

    closeRTCPeerConnection(): never {
        throw new ShouldNotBeUsedDuringSsrException('WebRtcConnectionService');
    }
}
