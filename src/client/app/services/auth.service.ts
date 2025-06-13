import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { computed, DestroyRef, Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';

import { catchError, EMPTY, finalize, Observable, of, switchMap, tap } from 'rxjs';

import { API_TOKEN } from '@client/app/tokens/api.token';
import { WsService } from '@client/services/ws.service';
import { User } from '@shared/models/user';
import { UserData } from '@shared/models/user.data';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private readonly _user = signal<User | null>(null);
    readonly user = computed(() => this._user());
    readonly isAuthed = computed(() => !!this.user());
    readonly isAuthed$: Observable<boolean> = toObservable(this.isAuthed);

    constructor(
        private readonly http: HttpClient,
        @Inject(API_TOKEN)
        private readonly api: string,
        @Inject(PLATFORM_ID)
        private readonly id: string,
        private readonly wsService: WsService,
        private readonly destroyRef: DestroyRef
    ) {}

    initAuthentication(): Observable<User> {
        return this.profile();
    }

    initActiveUserObserving(): void {
        if (isPlatformBrowser(this.id)) {
            this.isAuthed$
                .pipe(
                    switchMap((isAuthed) => (isAuthed ? this.wsService.provideConnection('active-user') : EMPTY)),
                    takeUntilDestroyed(this.destroyRef)
                )
                .subscribe();
        }
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
