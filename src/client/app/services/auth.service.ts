import { HttpClient } from '@angular/common/http';
import { computed, Inject, Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

import { catchError, EMPTY, finalize, Observable, of, switchMap, tap } from 'rxjs';

import { API_TOKEN } from '@client/app/tokens/api.token';
import { User } from '@shared/models/user';
import { UserData } from '@shared/models/user.data';
import { Nullable } from '@shared/types/nullable';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private readonly _user = signal<Nullable<User>>(null);
    readonly user = computed(() => this._user());
    readonly isAuthed = computed(() => !!this.user());
    readonly isAuthed$: Observable<boolean> = toObservable(this.isAuthed);

    constructor(
        private readonly http: HttpClient,
        @Inject(API_TOKEN)
        private readonly api: string
    ) {}

    initAuthentication(): Observable<User> {
        return this.profile();
    }

    registerLoginPassword(userData: UserData): Observable<User> {
        return this.http.post<void>(`${this.api}/auth/login-password-strategy/register`, userData).pipe(
            switchMap(() => this.profile()),
            catchError(() => {
                this._user.set(null);
                return EMPTY;
            })
        );
    }

    authenticateLoginPassword(userData: UserData): Observable<User> {
        return this.http.post<void>(`${this.api}/auth/login-password-strategy`, userData).pipe(
            switchMap(() => this.profile()),
            catchError(() => {
                this._user.set(null);
                return EMPTY;
            })
        );
    }

    logout(): Observable<void> {
        return this.http.post<void>(`${this.api}/auth/logout`, {}).pipe(finalize(() => this._user.set(null)));
    }

    profile(): Observable<User> {
        const user = this.user();
        if (user) {
            return of(user);
        }

        return this.http.get<User>(`${this.api}/user/who-am-i`).pipe(
            tap((user: User) => {
                this._user.set(user);
            }),
            catchError(() => {
                this._user.set(null);
                return EMPTY;
            })
        );
    }
}
