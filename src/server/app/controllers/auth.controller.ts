import express from 'express';

import { AuthenticateService } from '@server/services/authenticate.service';
import { UserService } from '@server/services/user.service';
import userSchema from '@server/validations/user.schema';
import { UserData } from '@shared/models/user.data';

const validateUserData = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const data: UserData = req.body;

    const { error } = userSchema(data);
    if (error) {
        res.status(400).json({ error });
    } else {
        next();
    }
};

const createUser = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        await UserService.create(req.body);
        next();
    } catch (err) {
        next(err);
    }
};

const authController = express
    .Router()
    .post('/login-password-strategy', validateUserData, AuthenticateService.authenticateLoginPassword)
    .post(
        '/login-password-strategy/register',
        validateUserData,
        createUser,
        AuthenticateService.authenticateLoginPassword
    )
    .post('/logout', AuthenticateService.logout);

export { authController as AuthController };
