import { filter, Observable } from 'rxjs';

import { ServerWsMessage } from '@server/app/models/server-ws-session';
import { WsMeetingClientEvents } from '@shared/models/ws-event';

export const meetingWsEvents =
    (meetingId: string) =>
    <T extends keyof WsMeetingClientEvents>(source: Observable<ServerWsMessage<T>>) =>
        source.pipe(filter((msg) => msg.data.meetingId === meetingId));
