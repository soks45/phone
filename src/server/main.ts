import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import dotenv from 'dotenv';
import express from 'express';

import { ApiController } from '@server/app/api.controller';
import { ClientController } from '@server/client.controller';
import { DatabaseService } from '@server/services/database.service';

async function run(): Promise<void> {
    dotenv.config();
    const port = process.env['SERVER_PORT'] || 4000;

    await DatabaseService.connect();

    express()
        .use(express.json())
        .use(express.urlencoded({ extended: false }))
        /** api */
        .use('/api', ApiController)
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
