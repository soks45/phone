import express, { Express } from 'express';
import dotenv from 'dotenv';
import { setupClient } from './setup-client';

export function app(): express.Express {
    const server: Express = express();
    setupClient(server);

    return server;
}

function run(): void {
    const port = process.env['SERVER_PORT'] || 4000;

    const server = app();
    dotenv.config();

    server.listen(port, () => {
        console.log(`Node Express server listening on http://localhost:${port}`);
    });
}

run();
