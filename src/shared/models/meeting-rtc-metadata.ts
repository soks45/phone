export interface MeetingRtcMetadata {
    readonly connectionId: string;
    readonly transceivers: MeetingRtcTransceiversMetadata[];
}

export interface MeetingRtcTransceiversMetadata {
    readonly mid: string;
    readonly meta: RtcTransceiverMetadata;
}

export interface RtcTransceiverMetadata {
    readonly userId: number;
}
