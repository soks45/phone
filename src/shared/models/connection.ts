export type ConnectionState = 'opened' | 'closed';

export interface Connection {
    readonly id: string;
    readonly state: ConnectionState;
}
