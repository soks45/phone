import { HttpStatusCode } from '@angular/common/http';

import express, { Request, Response } from 'express';

import { StatusException } from '@server/exceptions/status.exception';
import { ConnectionService } from '@server/services/connection.service';
import uuidSchema from '@server/validations/uuid.schema';
import { WebRtcConnectionDto } from '@shared/models/web-rtc-connection.dto';

const connectionController = express
    .Router()
    .get('/all', (req: Request, res: Response) => {
        const connections: WebRtcConnectionDto[] = ConnectionService.getConnections().map((connection) =>
            connection.toJSON()
        );
        res.status(200).json(connections);
    })
    .get('/:uuid', async (req, res, next) => {
        const uuid: string = req.params.uuid;

        const { error } = uuidSchema(uuid);
        if (error) {
            res.status(400).json({ error });
            return;
        }

        try {
            const rtcConnectionDto: WebRtcConnectionDto | undefined = ConnectionService.getConnection(uuid)?.toJSON();
            if (rtcConnectionDto) {
                res.status(200).json(rtcConnectionDto);
            } else {
                throw new StatusException(HttpStatusCode.NotFound, 'Connection not found');
            }
        } catch (err) {
            next(err);
        }
    })
    .post('/', async (req: Request, res: Response) => {
        try {
            const connection = await ConnectionService.createConnection();
            res.send(connection.toJSON());
        } catch (error) {
            throw new StatusException(HttpStatusCode.InternalServerError, 'Failed to create connection');
        }
    });

export { connectionController as ConnectionController };
