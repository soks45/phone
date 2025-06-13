export interface WsEvents {
    message: string;
    error: string;
    isActive: boolean;
}

export interface WsMessage<K extends keyof WsEvents = keyof WsEvents> {
    type: K;
    data: WsEvents[K];
}

export function serializeWsEvent<K extends keyof WsEvents = keyof WsEvents>(event: WsMessage<K>): string {
    return JSON.stringify(event);
}

export function deserializeWsEvent<K extends keyof WsEvents = keyof WsEvents>(rawData: string): WsMessage<K> {
    return JSON.parse(rawData);
}
