import { HttpStatusCode } from '@angular/common/http';

import { Request, Response, NextFunction, Handler } from 'express';
import { RequestHandler } from 'express-serve-static-core';
import passport from 'passport';
import passportLocal, { IVerifyOptions } from 'passport-local';

import { StatusException } from '@server/exceptions/status.exception';
import { UserService } from '@server/services/user.service';
import { User } from '@shared/models/user';

const LocalStrategy = passportLocal.Strategy;

class AuthenticateService {
    private isInitialized: boolean = false;

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

    initialize(): Handler {
        if (!this.isInitialized) {
            passport.serializeUser((user, done) => {
                done(null, {
                    id: user.id,
                });
            });

            passport.deserializeUser(async ({ id }: { id: number }, done) => {
                const user: User = await UserService.read(id);
                done(null, user);
            });

            passport.use(
                new LocalStrategy(
                    { usernameField: 'login', passwordField: 'password_hash' },
                    async (
                        username: string,
                        password: string,
                        done: (error: any, user?: Express.User | false, options?: IVerifyOptions) => void
                    ) => {
                        const user: User = await UserService.readByLogin(username);

                        if (user.password_hash === password) {
                            done(null, user);
                        } else {
                            done(new StatusException(HttpStatusCode.Unauthorized, 'Unauthorized'), user);
                        }
                    }
                )
            );

            this.isInitialized = true;
        }

        return passport.initialize();
    }

    session() {
        return passport.session();
    }
}

const instance = new AuthenticateService();

export { instance as AuthenticateService };
