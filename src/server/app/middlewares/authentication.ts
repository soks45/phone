import connectPgSimple from 'connect-pg-simple';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { RequestHandler } from 'express-serve-static-core';
import session from 'express-session';

import { AuthenticateService } from '@server/services/authenticate.service';
import { DatabaseService } from '@server/services/database.service';

dotenv.config();
const cookieSecret: string = process.env['COOKIE_SECRET'] || 'COOKIE_SECRET';

export const authentication: RequestHandler[] = [
    cookieParser(cookieSecret),
    session({
        secret: cookieSecret,
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }, // 7 days
        store: new (connectPgSimple(session))({
            pool: DatabaseService,
            tableName: 'session',
        }),
    }),
    AuthenticateService.initialize(),
    AuthenticateService.session(),
];

export const isAuthenticated = AuthenticateService.isAuthenticated;
