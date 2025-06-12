import { ConnectionState } from '@server/app/models/base-connection';

export interface Connection {
    readonly id: string;
    readonly state: ConnectionState;
}
