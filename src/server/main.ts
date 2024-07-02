import express, { Express } from 'express';
import dotenv from 'dotenv';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { apiController } from './api/api.controller';
import { clientController } from './client.controller';

function run(): void {
    dotenv.config();
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
                cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 дней
            })
        )
        /** api */
        .use('/api', apiController())
        /** Set up view engine */
        .set('view engine', 'html')
        .set('views', resolve(dirname(fileURLToPath(import.meta.url)), '../browser'))
        /** Serve client */
        .use('/', clientController());

    server.listen(port, () => {
        console.log(`Node Express server listening on http://localhost:${port}`);
    });
}

run();
