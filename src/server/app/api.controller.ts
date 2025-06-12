import connectPgSimple from 'connect-pg-simple';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { Router } from 'express';
import session from 'express-session';
import logger from 'morgan';

import { AuthController } from '@server/controllers/auth.controller';
import { ConnectionController } from '@server/controllers/connection.controller';
import { UserController } from '@server/controllers/user.controller';
import { AuthenticateService } from '@server/services/authenticate.service';
import { DatabaseService } from '@server/services/database.service';

dotenv.config();
const cookieSecret: string = process.env['COOKIE_SECRET'] || 'COOKIE_SECRET';
const apiLogger = logger('dev');

const apiController = Router()
    /** cookie */
    .use(apiLogger)
    .use(cookieParser(cookieSecret))
    .use(
        session({
            secret: cookieSecret,
            resave: false,
            saveUninitialized: true,
            cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }, // 7 days
            store: new (connectPgSimple(session))({
                pool: DatabaseService,
                tableName: 'session',
            }),
        })
    )
    .use(AuthenticateService.initialize())
    .use(AuthenticateService.session())
    /** controllers */
    .use('/auth', AuthController)
    .use('/user', AuthenticateService.isAuthenticated, UserController)
    .use('/connection', /*AuthenticateService.isAuthenticated,*/ ConnectionController);

export { apiController as ApiController };
