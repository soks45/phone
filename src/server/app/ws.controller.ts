import { Express, Router } from 'express';
import expressWs from 'express-ws';

import { authentication } from '@server/app/middlewares/authentication';
import { ServerWsSession } from '@server/app/models/server-ws-session';
import { MeetingService } from '@server/services/meeting.service';

const wsController = (app: Express) => {
    expressWs(app);

    return Router()
        .use(authentication)
        .ws('/', (ws, req) => {
            if (req.isAuthenticated() && req.user) {
                const connection = new ServerWsSession(req.user.id, req.sessionID, ws);
                MeetingService.register(connection);
            } else {
                ws.close();
            }
        });
};

export { wsController as WsController };
