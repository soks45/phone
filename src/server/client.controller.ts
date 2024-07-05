import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';

import express, { Request, Response, NextFunction, Router } from 'express';

import { CLIENT_COOKIE_TOKEN } from '@client/app/tokens/client-cookie.token';
import bootstrap from '@client/main.server';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');
const indexHtml = join(serverDistFolder, 'index.server.html');

const commonEngine = new CommonEngine();
const url = (req: Request) => {
    const { protocol, originalUrl, headers } = req;
    return ` ${protocol}://${headers.host}${originalUrl}`;
};

const clientController = Router()
    /** Serve static files, e.g. SSG`ed pages */
    .get(
        '**',
        express.static(browserDistFolder, {
            maxAge: '1y',
            index: 'index.html',
        })
    )
    /** Serve SSR pages */
    .get('**', (req: Request, res: Response, next: NextFunction) => {
        console.log(`SSR: ${url(req)}`);

        commonEngine
            .render({
                bootstrap,
                documentFilePath: indexHtml,
                url: url(req),
                publicPath: browserDistFolder,
                inlineCriticalCss: false,
                providers: [
                    { provide: APP_BASE_HREF, useValue: req.baseUrl },
                    { provide: CLIENT_COOKIE_TOKEN, useValue: req.headers.cookie },
                ],
            })
            .then((html) => res.send(html))
            .catch((err) => next(err));
    });

export { clientController as ClientController };
