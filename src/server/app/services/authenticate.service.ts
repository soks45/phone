import { HttpStatusCode } from '@angular/common/http';

import { Request, Response, NextFunction, Handler } from 'express';
import { RequestHandler } from 'express-serve-static-core';
import passport from 'passport';
import passportLocal, { IVerifyOptions } from 'passport-local';

import { StatusException } from '@server/exceptions/status.exception';
import { UserService } from '@server/services/user.service';
import { User } from '@shared/models/user';
import { UserFull } from '@shared/models/user-full';

const LocalStrategy = passportLocal.Strategy;

class AuthenticateService {
    /**
     * Login Required middleware.
     */
    readonly isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
        if (req.isAuthenticated()) {
            return next();
        } else {
            next(new StatusException(HttpStatusCode.Unauthorized, 'Unauthorized'));
        }
    };

    readonly authenticateLoginPassword = (req: Request, res: Response, next: NextFunction): RequestHandler => {
        return passport.authenticate('local', (err: Error, user: User) => {
            if (err) {
                return next(new StatusException(HttpStatusCode.Unauthorized, 'Unauthorized'));
            }
            req.logIn(user, (err) => {
                if (err) {
                    return next(new StatusException(HttpStatusCode.Unauthorized, 'Unauthorized'));
                }
                res.status(200).json({});
            });
        })(req, res, next);
    };

    readonly logout = (req: Request, res: Response): void => {
        req.logout(() => res.status(200).json({}));
    };

    initialize(): Handler {
        passport.serializeUser((user, done) => {
            done(null, {
                id: user.id,
            });
        });

        passport.deserializeUser(async ({ id }: { id: number }, done) => {
            try {
                const user: User = await UserService.read(id);
                done(null, user);
            } catch (err) {
                done(err);
            }
        });

        passport.use(
            new LocalStrategy(
                { usernameField: 'login', passwordField: 'password_hash' },
                async (
                    username: string,
                    password: string,
                    done: (error: any, user?: Express.User | false, options?: IVerifyOptions) => void
                ) => {
                    try {
                        const user: UserFull = await UserService.readByLoginFull(username);

                        if (user.password_hash === password) {
                            done(null, user);
                        } else {
                            done(new StatusException(HttpStatusCode.Unauthorized, 'Unauthorized'), user);
                        }
                    } catch (err) {
                        done(new StatusException(HttpStatusCode.Unauthorized, 'Unauthorized'));
                    }
                }
            )
        );

        return passport.initialize();
    }

    session() {
        return passport.session();
    }
}

const instance = new AuthenticateService();

export { instance as AuthenticateService };
