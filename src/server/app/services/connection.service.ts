import { filter, take } from 'rxjs';

import { WebRtcConnectionServer } from '@server/app/models/web-rtc-connection.server';
import { ConnectionRepository } from '@server/repositories/connection.repository';
import { AppException } from '@shared/exceptions/app.exception';

class ConnectionService {
    private readonly currentConnections: Map<string, WebRtcConnectionServer> = new Map<
        string,
        WebRtcConnectionServer
    >();

    async createConnection(userId: number): Promise<WebRtcConnectionServer> {
        const newConnection = await ConnectionRepository.create();
        const wrtcConnection = new WebRtcConnectionServer(newConnection.id);
        this.observeCloseConnection(wrtcConnection);
        try {
            await wrtcConnection.addClientTracks();
            await wrtcConnection.doOffer();
        } catch (err) {
            throw err;
        }
        this.currentConnections.set(newConnection.id, wrtcConnection);

        return wrtcConnection;
    }
    async upgradeConnection(connectionId: string): Promise<WebRtcConnectionServer> {
        const wrtcConnection = this.getConnection(connectionId);
        if (!wrtcConnection) {
            throw new AppException(`[ConnectionService] connection not found: ${connectionId}`);
        }
        try {
            await wrtcConnection.doOffer();
        } catch (err) {
            throw err;
        }

        return wrtcConnection;
    }
    async closeConnection(id: string): Promise<void> {
        this.getConnection(id)?.close();
        await ConnectionRepository.close(id);
    }
    getConnection(id: string): WebRtcConnectionServer | undefined {
        return this.currentConnections.get(id);
    }
    getConnections(): WebRtcConnectionServer[] {
        return [...this.currentConnections.values()];
    }

    private observeCloseConnection(wrtcConnection: WebRtcConnectionServer): void {
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
