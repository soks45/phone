import { Connection } from '@shared/models/connection';

export interface WebRtcConnectionDto extends Connection {
    readonly iceConnectionState: any;
    readonly localDescription: any;
    readonly remoteDescription: any;
    readonly signalingState: any;
}
