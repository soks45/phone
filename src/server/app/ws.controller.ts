import { Express, Router } from 'express';
import expressWs from 'express-ws';

import { authentication } from '@server/app/middlewares/authentication';
import { ActiveUsersService } from '@server/services/active-users.service';

const wsController = (app: Express) => {
    expressWs(app);

    return Router()
        .use(authentication)
        .ws('/active-user', (ws, req) => {
            if (req.isAuthenticated() && req.user) {
                ActiveUsersService.add(req.user.id);

                ws.on('close', () => {
                    ActiveUsersService.remove(req.user.id);
                });
                return;
            }

            ws.close();
        });
};

export { wsController as WsController };
