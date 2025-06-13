import { Router } from 'express';
import logger from 'morgan';

import { authentication, isAuthenticated } from '@server/app/middlewares/authentication';
import { AuthController } from '@server/controllers/auth.controller';
import { ConnectionController } from '@server/controllers/connection.controller';
import { MeetingController } from '@server/controllers/meeting.controller';
import { UserController } from '@server/controllers/user.controller';

const apiLogger = logger('dev');

const restController = Router()
    /** cookie */
    .use(apiLogger)
    .use(authentication)
    /** controllers */
    .use('/auth', AuthController)
    .use('/user', isAuthenticated, UserController)
    .use('/connection', isAuthenticated, ConnectionController)
    .use('/meeting', isAuthenticated, MeetingController);

export { restController as RestController };
