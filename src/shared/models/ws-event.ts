import { WsSession } from '@shared/models/ws-session';

export interface WsEvents {
    message: string;
    error: string;
    meetingConnect: { meetingId: string };
    meetingDisconnect: { meetingId: string };
    meetingGetPeers: { meetingId: string };

    meetingConnected: { meetingId: string };
    meetingDisconnected: { meetingId: string };
    meetingJoined: { meetingId: string; userId: number };
    meetingLeft: { meetingId: string; userId: number };
    meetingPeers: { meetingId: string; peers: WsSession[] };

    wsReady: boolean;
}

export interface WsMessage<K extends keyof WsEvents = keyof WsEvents> {
    readonly type: K;
    readonly data: WsEvents[K];
}

export function serializeWsEvent<K extends keyof WsEvents = keyof WsEvents>(event: WsMessage<K>): string {
    return JSON.stringify(event);
}

export function deserializeWsEvent<K extends keyof WsEvents = keyof WsEvents>(rawData: string): WsMessage<K> {
    return JSON.parse(rawData);
}

export function isThatType<K extends keyof WsEvents>(type: K, wsMessage: WsMessage): wsMessage is WsMessage<K> {
    return wsMessage.type === type;
}
