import { Router } from 'express';
import { UserController } from './controllers/user.controller';

const appController = Router().use('/user', UserController);

export { appController as AppController };
