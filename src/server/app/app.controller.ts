import { Router } from 'express';

export function appController(): Router {
    return Router().get('/', (req, res) => {
        res.status(200).json('hello world');
    });
}
