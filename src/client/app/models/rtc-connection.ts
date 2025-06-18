import { WebRtcConnectionDto } from '@shared/models/web-rtc-connection.dto';

export class RtcConnection {
    constructor(
        readonly peerConnection: RTCPeerConnection,
        readonly remoteConnection: WebRtcConnectionDto
    ) {}
}
