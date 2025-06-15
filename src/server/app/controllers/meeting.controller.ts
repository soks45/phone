import { HttpStatusCode } from '@angular/common/http';

import express from 'express';

import { MeetingService } from '@server/services/meeting.service';
import uuidSchema from '@server/validations/uuid.schema';
import { StatusException } from '@shared/exceptions/status.exception';

const meetingController = express
    .Router()
    .post('/', async (req, res, next) => {
        try {
            const meeting = await MeetingService.create();
            res.send(meeting);
        } catch (err) {
            next(err);
        }
    })
    .delete('/:uuid', async (req, res, next) => {
        const uuid: string = req.params.uuid;

        const { error } = uuidSchema(uuid);
        if (error) {
            res.status(400).json({ error });
            return;
        }

        try {
            await MeetingService.close(uuid);
            res.status(HttpStatusCode.Accepted).json({});
        } catch (err) {
            next(err);
        }
    })
    .get('/:uuid', async (req, res, next) => {
        const uuid: string = req.params.uuid;

        const { error } = uuidSchema(uuid);
        if (error) {
            res.status(400).json({ error });
            return;
        }

        try {
            const meeting = await MeetingService.get(uuid);
            res.send(meeting);
        } catch (err) {
            next(new StatusException(404, `Meeting does not exist or is closed: ${uuid}`));
        }
    })
    .post('/:uuid/join', async (req, res, next) => {
        const uuid: string = req.params.uuid;
        const userId: number = req.user?.id!;

        const { error } = uuidSchema(uuid);
        if (error) {
            res.status(400).json({ error });
            return;
        }

        try {
            const meeting = await MeetingService.get(uuid);

            if (!meeting || !meeting.is_active) {
                throw new StatusException(400, `Meeting does not exist or is closed: ${uuid}`);
            }

            await MeetingService.join(uuid, userId);

            return res.status(200).json(meeting);
        } catch (err) {
            return next(err);
        }
    });
export { meetingController as MeetingController };
