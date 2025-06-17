import { Subscription } from 'rxjs';

import { meetingWsEvents } from '@server/app/models/meeting-ws-events';
import { ServerWsMessage, ServerWsSession } from '@server/app/models/server-ws-session';
import { WsMeetingClientEvents } from '@shared/models/ws-event';

export class MeetingEventListenerBuilder {
    private readonly _listeners: (() => Subscription)[] = [];

    constructor(
        private readonly session: ServerWsSession,
        private readonly meetingId: string
    ) {}

    on<T extends keyof WsMeetingClientEvents>(type: T, listener: (message: ServerWsMessage<T>) => void): this {
        this._listeners.push(() => {
            return this.session
                .message(type)
                .pipe(meetingWsEvents(this.meetingId))
                .subscribe((v) => listener(v));
        });
        return this;
    }

    onClose(listener: () => void): this {
        this._listeners.push(() => this.session.closed().subscribe(listener));

        return this;
    }

    build(): Subscription {
        const sub = new Subscription();

        this._listeners.forEach((listener) => sub.add(listener()));

        return sub;
    }
}
