import { HttpStatusCode } from '@angular/common/http';

import express, { Request, Response } from 'express';

import { WebRtcConnectionServer } from '@server/app/models/web-rtc-connection.server';
import { ConnectionService } from '@server/services/connection.service';
import uuidSchema from '@server/validations/uuid.schema';
import { StatusException } from '@shared/exceptions/status.exception';
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
                next(new StatusException(HttpStatusCode.NotFound, 'Connection not found'));
            }
        } catch (err) {
            next(err);
        }
    })
    .post('/', async (req: Request, res: Response, next) => {
        try {
            const connection = await ConnectionService.createConnection(req.user?.id!);
            res.send(connection.toJSON());
        } catch (error) {
            next(new StatusException(HttpStatusCode.InternalServerError, 'Failed to create connection'));
        }
    })
    .put('/:uuid', async (req, res, next) => {
        const uuid: string = req.params.uuid;

        const { error } = uuidSchema(uuid);
        if (error) {
            res.status(400).json({ error });
            return;
        }

        try {
            const connection = await ConnectionService.upgradeConnection(uuid);
            res.send(connection.toJSON());
        } catch (error) {
            next(new StatusException(HttpStatusCode.InternalServerError, 'Failed to create connection'));
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
            const connection: WebRtcConnectionServer | undefined = ConnectionService.getConnection(uuid);
            if (connection) {
                await ConnectionService.closeConnection(uuid);
                res.send(connection.toJSON());
            } else {
                next(new StatusException(HttpStatusCode.NotFound, 'Connection not found'));
            }
        } catch (err) {
            next(err);
        }
    })
    .get('/:uuid/local-description', async (req, res, next) => {
        const uuid: string = req.params.uuid;

        const { error } = uuidSchema(uuid);
        if (error) {
            res.status(400).json({ error });
            return;
        }

        try {
            const rtcConnectionDto: WebRtcConnectionDto | undefined = ConnectionService.getConnection(uuid)?.toJSON();
            if (rtcConnectionDto) {
                res.send(rtcConnectionDto.localDescription);
            } else {
                next(new StatusException(HttpStatusCode.NotFound, 'Connection not found'));
            }
        } catch (err) {
            next(err);
        }
    })
    .get('/:uuid/remote-description', async (req, res, next) => {
        const uuid: string = req.params.uuid;

        const { error } = uuidSchema(uuid);
        if (error) {
            res.status(400).json({ error });
            return;
        }

        try {
            const rtcConnectionDto: WebRtcConnectionDto | undefined = ConnectionService.getConnection(uuid)?.toJSON();
            if (rtcConnectionDto) {
                res.send(rtcConnectionDto.remoteDescription);
            } else {
                next(new StatusException(HttpStatusCode.NotFound, 'Connection not found'));
            }
        } catch (err) {
            next(err);
        }
    })
    .post('/:uuid/remote-description', async (req, res, next) => {
        const uuid: string = req.params.uuid;

        const { error } = uuidSchema(uuid);
        if (error) {
            res.status(400).json({ error });
            return;
        }

        try {
            const connection: WebRtcConnectionServer | undefined = ConnectionService.getConnection(uuid);
            if (connection) {
                try {
                    await connection.applyAnswer(req.body);
                    res.send(connection.toJSON().remoteDescription);
                } catch (error) {
                    next(new StatusException(HttpStatusCode.BadRequest, `Failed to set remote description ${uuid}`));
                }
            } else {
                next(new StatusException(HttpStatusCode.NotFound, 'Connection not found'));
            }
        } catch (err) {
            next(err);
        }
    });
export { connectionController as ConnectionController };
