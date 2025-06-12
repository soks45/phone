import { filter, take } from 'rxjs';

import { WebRtcConnection } from '@server/app/models/web-rtc-connection';
import { ConnectionRepository } from '@server/repositories/connection.repository';

class ConnectionService {
    private readonly currentConnections: Map<string, WebRtcConnection> = new Map<string, WebRtcConnection>();

    async createConnection(): Promise<WebRtcConnection> {
        const newConnection = await ConnectionRepository.create();
        const wrtcConnection = new WebRtcConnection(newConnection.id);
        this.observeCloseConnection(wrtcConnection);
        await wrtcConnection.doOffer();
        this.currentConnections.set(newConnection.id, wrtcConnection);

        return wrtcConnection;
    }
    async closeConnection(id: string): Promise<void> {
        await ConnectionRepository.close(id);
        this.currentConnections.delete(id);
    }
    getConnection(id: string): WebRtcConnection | undefined {
        return this.currentConnections.get(id);
    }
    getConnections(): WebRtcConnection[] {
        return [...this.currentConnections.values()];
    }

    private observeCloseConnection(wrtcConnection: WebRtcConnection): void {
        wrtcConnection
            .pipe(
                filter((isOpened) => !isOpened),
                take(1)
            )
            .subscribe(() => {
                this.closeConnection(wrtcConnection.id);
                this.currentConnections.delete(wrtcConnection.id);
            });
    }
}

const instance = new ConnectionService();

export { instance as ConnectionService };
