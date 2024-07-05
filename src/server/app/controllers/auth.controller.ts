import express from 'express';

import { UserService } from '@server/services/user.service';
import userSchema from '@server/validations/user.schema';
import { UserData } from '@shared/models/user.data';

const authController = express
    .Router()
    .post('/login-password-strategy', async (req, res, next) => {
        const data: UserData = req.body;

        const { error } = userSchema(data);
        if (error) {
            res.status(400).json({ error });
        }

        res.status(200).json();
    })
    .post('/login-password-strategy/register', async (req, res, next) => {
        const data: UserData = req.body;

        const { error } = userSchema(data);
        if (error) {
            res.status(400).json({ error });
        }

        try {
            const id: number = await UserService.create(data);
            res.status(200).json({ id });
        } catch (err) {
            next(err);
        }
    });

export { authController as AuthController };
