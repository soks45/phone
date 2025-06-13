import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import dotenv from 'dotenv';
import express from 'express';

import { RestController } from '@server/app/rest.controller';
import { WsController } from '@server/app/ws.controller';
import { ClientController } from '@server/client.controller';
import { DatabaseService } from '@server/services/database.service';

async function run(): Promise<void> {
    dotenv.config();
    const port = process.env['SERVER_PORT'] || 4000;

    try {
        await DatabaseService.connect();
        console.log('Database Connected');
    } catch (error) {
        console.error(error);
    }

    const app = express();

    app.use(express.json())
        .use(express.urlencoded({ extended: false }))
        /** api */
        .use('/api', RestController)
        .use('/ws', WsController(app))
        /** Set up view engine */
        .set('view engine', 'html')
        .set('views', resolve(dirname(fileURLToPath(import.meta.url)), '../browser'))
        /** Serve client */
        .use('/', ClientController)
        .listen(port, () => {
            console.log(`Node Express server listening on http://localhost:${port}`);
        });
}

run();
