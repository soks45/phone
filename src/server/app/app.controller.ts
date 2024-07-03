import { Router } from 'express';
import { UserController } from './controllers/user.controller';

export function appController(): Router {
    return Router().use('/user', UserController);
}
