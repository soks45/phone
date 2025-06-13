import { ShouldNotBeUsedDuringSsrException } from '@client/app/exceptions/should-not-be-used-during-ssr.exception';
import { WebRtcConnectionService } from '@client/services/web-rtc-connection.service';

/**
 * Stub for SSR
 * */
export class WebRtcServerConnectionService extends WebRtcConnectionService {
    constructor() {
        super();
    }

    closeConnection(): never {
        throw new ShouldNotBeUsedDuringSsrException('WebRtcConnectionService');
    }

    createConnection(): never {
        throw new ShouldNotBeUsedDuringSsrException('WebRtcConnectionService');
    }
}
