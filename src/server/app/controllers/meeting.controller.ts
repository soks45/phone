import { HttpStatusCode } from '@angular/common/http';

import express from 'express';

import { MeetingService } from '@server/services/meeting.service';
import meetingSchema from '@server/validations/meeting.schema';
import uuidSchema from '@server/validations/uuid.schema';
import { StatusException } from '@shared/exceptions/status.exception';
import { MeetingData } from '@shared/models/meeting.data';

const meetingController = express
    .Router()
    .post('/', async (req, res, next) => {
        const parameters: MeetingData = req.body;

        const { error } = meetingSchema(parameters);
        if (error) {
            res.status(400).json({ error });
            return;
        }

        try {
            const meeting = await MeetingService.create(parameters);
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
    .get('/:uuid/participants', async (req, res, next) => {
        const uuid: string = req.params.uuid;

        const { error } = uuidSchema(uuid);
        if (error) {
            res.status(400).json({ error });
            return;
        }

        try {
            const meeting = await MeetingService.getParticipants(uuid);
            res.send(meeting);
        } catch (err) {
            next(new StatusException(404, `Meeting does not exist or is closed: ${uuid}`));
        }
    })
    .get('/:uuid/messages', async (req, res, next) => {
        const uuid: string = req.params.uuid;

        const { error } = uuidSchema(uuid);
        if (error) {
            res.status(400).json({ error });
            return;
        }

        try {
            const meeting = await MeetingService.chatMessages(uuid);
            res.send(meeting);
        } catch (err) {
            next(new StatusException(404, `Meeting does not exist or is closed: ${uuid}`));
        }
    });
export { meetingController as MeetingController };
