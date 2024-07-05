import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express, { Express } from 'express';
import session, { MemoryStore } from 'express-session';
import logger from 'morgan';

import { AppController } from '@server/app/app.controller';
import { ClientController } from '@server/client.controller';
import { AuthenticateService } from '@server/services/authenticate.service';
import { DatabaseService } from '@server/services/database.service';

async function run(): Promise<void> {
    dotenv.config();
    await DatabaseService.connect();

    const port = process.env['SERVER_PORT'] || 4000;
    const cookieSecret: string = process.env['COOKIE_SECRET'] || 'COOKIE_SECRET';

    const server: Express = express()
        .use(logger('dev'))
        .use(express.json())
        .use(express.urlencoded({ extended: false }))
        /** cookie */
        .use(cookieParser(cookieSecret))
        .use(
            session({
                secret: cookieSecret,
                resave: false,
                saveUninitialized: true,
                cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 days
                store: new MemoryStore({
                    captureRejections: true,
                }),
            })
        )
        .use(AuthenticateService.initialize())
        .use(AuthenticateService.session())
        /** api */
        .use('/api', AppController)
        /** Set up view engine */
        .set('view engine', 'html')
        .set('views', resolve(dirname(fileURLToPath(import.meta.url)), '../browser'))
        /** Serve client */
        .use('/', ClientController);

    server.listen(port, () => {
        console.log(`Node Express server listening on http://localhost:${port}`);
    });
}

run();
