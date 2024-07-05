import { Router } from 'express';

import { AuthController } from '@server/controllers/auth.controller';
import { UserController } from '@server/controllers/user.controller';

const appController = Router().use('/auth', AuthController).use('/user', UserController);

export { appController as AppController };
