import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { API_TOKEN } from '@client/app/tokens/api.token';
import { UserData } from '@shared/models/user.data';

export interface IAuthService {
    login: string;
    password_hash: string;
}

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    constructor(
        private readonly http: HttpClient,
        @Inject(API_TOKEN) private readonly api: string
    ) {}

    registerLoginPassword(userData: UserData): Observable<void> {
        return this.http.post<void>(`${this.api}/auth/login-password-strategy/register`, userData);
    }

    authenticateLoginPassword(userData: UserData): Observable<void> {
        return this.http.post<void>(`${this.api}/auth/login-password-strategy`, userData);
    }
}
