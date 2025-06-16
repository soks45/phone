import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { API_TOKEN } from '@client/app/tokens/api.token';
import { Meeting } from '@shared/models/meeting';
import { MeetingData } from '@shared/models/meeting.data';

@Injectable({
    providedIn: 'root',
})
export class MeetingService {
    constructor(
        @Inject(API_TOKEN)
        private readonly api: string,
        private readonly http: HttpClient
    ) {}

    get(id: string): Observable<Meeting> {
        return this.http.get<Meeting>(`${this.api}/meeting/${id}`);
    }

    create(data: MeetingData): Observable<Meeting> {
        return this.http.post<Meeting>(`${this.api}/meeting`, data);
    }

    close(id: string): Observable<void> {
        return this.http.delete<void>(`${this.api}/meeting/${id}`);
    }

    join(id: string): Observable<Meeting> {
        return this.http.post<Meeting>(`${this.api}/meeting/${id}/join`, {});
    }
}
