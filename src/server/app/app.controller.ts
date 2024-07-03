import { Router } from 'express';

import { UserController } from '@server/controllers/user.controller';

const appController = Router().use('/user', UserController);

export { appController as AppController };
