import { AppException } from '@shared/exceptions/app.exception';
import { MeetingMessage } from '@shared/models/meeting-message';
import { MeetingRtcMetadata } from '@shared/models/meeting-rtc-metadata';
import { WsSession } from '@shared/models/ws-session';

export type WsEvents = WsCommonEvents & WsMeetingClientEvents & WsMeetingServerEvents;

export interface WsCommonEvents {
    message: string;
    error: AppException;
    wsReady: boolean;
}

export interface WsMeetingClientEvents {
    meetingConnect: { meetingId: string };
    meetingDisconnect: { meetingId: string };
    meetingGetPeers: { meetingId: string };
    meetingPostMessage: { meetingId: string; message: string };
    meetingRTCConnection: { meetingId: string; connectionId: string };
    meetingGetRTCConnectionMetadata: { meetingId: string };
}

export interface WsMeetingServerEvents {
    meetingConnected: { meetingId: string };
    meetingDisconnected: { meetingId: string };
    meetingJoined: { meetingId: string; userId: number };
    meetingLeft: { meetingId: string; userId: number };
    meetingPeers: { meetingId: string; peers: WsSession[] };
    meetingMessagePosted: { meetingId: string; message: MeetingMessage };
    meetingUpgradeRTCConnection: { meetingId: string };
    meetingRTCConnectionMetadata: { meetingId: string; metadata: MeetingRtcMetadata };
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
