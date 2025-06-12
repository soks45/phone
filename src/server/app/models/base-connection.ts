import { BehaviorSubject } from 'rxjs';

import { Connection } from '@shared/models/connection';

export type ConnectionState = 'opened' | 'closed';

export class BaseConnection extends BehaviorSubject<boolean> {
    constructor(public readonly id: string) {
        super(true);
    }

    close() {
        this.next(false);
    }

    toJSON(): Connection {
        return {
            id: this.id,
            state: this.getValue() ? 'opened' : 'closed',
        };
    }
}
