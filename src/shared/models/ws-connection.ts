import { Observable } from 'rxjs';

import { WsMessage } from '@shared/models/ws-event';

export interface WsConnection {
    send(message: WsMessage): void;
    messages(): Observable<WsMessage>;
    disconnected(): Observable<void>;
}
