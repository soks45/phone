import { Router } from 'express';

import { AuthController } from '@server/controllers/auth.controller';
import { UserController } from '@server/controllers/user.controller';
import { AuthenticateService } from '@server/services/authenticate.service';

const appController = Router()
    .use('/auth', AuthController)
    .use('/user', AuthenticateService.isAuthenticated, UserController);

export { appController as AppController };
