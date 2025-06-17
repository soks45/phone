import express, { Request, Response } from 'express';

import { UserService } from '@server/services/user.service';
import idSchema from '@server/validations/id.schema';
import userSchema from '@server/validations/user.schema';
import { User } from '@shared/models/user';
import { UserData } from '@shared/models/user.data';

const userController = express
    .Router()
    .get('/who-am-i', (req: Request, res: Response) => {
        res.status(200).json(req.user);
    })
    .get('/:id', async (req, res, next) => {
        const id: number = Number(req.params.id);

        const { error } = idSchema(id);
        if (error) {
            res.status(400).json({ error });
            return;
        }

        try {
            const user: User = await UserService.read(id);
            res.status(200).json(user);
        } catch (err) {
            next(err);
        }
    })
    .post('/', async (req, res, next) => {
        const data: UserData = req.body;

        const { error } = userSchema(data);
        if (error) {
            res.status(400).json({ error });
            return;
        }

        try {
            const id: number = await UserService.create(data);
            res.status(201).json({ id });
        } catch (err) {
            next(err);
        }
    })
    .put('/:id', async (req, res, next) => {
        const id: number = Number(req.params.id);
        const data: UserData = req.body;

        const idValidation = idSchema(id);
        if (idValidation.error) {
            res.status(400).json({ error: idValidation.error });
            return;
        }
        const userDataValidation = userSchema(data);
        if (userDataValidation.error) {
            res.status(400).json({ error: userDataValidation.error });
            return;
        }

        try {
            await UserService.update(id, data);
            res.status(204).json({});
        } catch (err) {
            next(err);
        }
    })
    .delete('/:id', async (req, res, next) => {
        const id: number = Number(req.params.id);

        const { error } = idSchema(id);
        if (error) {
            res.status(400).json({ error });
            return;
        }

        try {
            await UserService.delete(id);
            res.status(202).json({});
        } catch (err) {
            next(err);
        }
    });

export { userController as UserController };
