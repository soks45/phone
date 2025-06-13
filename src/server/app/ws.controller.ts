import { Express, Router } from 'express';
import expressWs from 'express-ws';

import { authentication } from '@server/app/middlewares/authentication';
import { deserializeWsEvent, WsMessage } from '@shared/models/ws-event';

const wsController = (app: Express) => {
    expressWs(app);

    return Router()
        .use(authentication)
        .ws('/', (ws, req) => {
            ws.on('open', () => {});

            ws.on('message', (msg) => {
                if (typeof msg === 'string') {
                    const deserialized: WsMessage = deserializeWsEvent(msg);
                    switch (deserialized.type) {
                        case 'message': {
                            break;
                        }
                        case 'error': {
                            break;
                        }
                    }
                }
            });

            ws.on('close', () => {});
        });
};

export { wsController as WsController };
