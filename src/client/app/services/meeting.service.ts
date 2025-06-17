import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';

import { filter, Observable, Subscriber, Subscription } from 'rxjs';

import { API_TOKEN } from '@client/app/tokens/api.token';
import { WsService } from '@client/services/ws.service';
import { Meeting } from '@shared/models/meeting';
import { MeetingData } from '@shared/models/meeting.data';
import { User } from '@shared/models/user';
import { WsSession } from '@shared/models/ws-session';

@Injectable({
    providedIn: 'root',
})
export class MeetingService {
    constructor(
        @Inject(API_TOKEN)
        private readonly api: string,
        private readonly http: HttpClient,
        private readonly wsService: WsService
    ) {}

    get(meetingId: string): Observable<Meeting> {
        return this.http.get<Meeting>(`${this.api}/meeting/${meetingId}`);
    }

    create(data: MeetingData): Observable<Meeting> {
        return this.http.post<Meeting>(`${this.api}/meeting`, data);
    }

    participants(meetingId: string): Observable<User[]> {
        return this.http.get<User[]>(`${this.api}/meeting/${meetingId}/participants`);
    }

    close(meetingId: string): Observable<void> {
        return this.http.delete<void>(`${this.api}/meeting/${meetingId}`);
    }

    join(meetingId: string): Observable<string> {
        return new Observable<string>((subscriber: Subscriber<string>) => {
            const sub: Subscription = this.wsService
                .ofType('meetingConnected')
                .pipe(filter((message) => message.data.meetingId === meetingId))
                .subscribe({
                    next: (value) => subscriber.next(value.data.meetingId),
                    complete: () => subscriber.complete(),
                    error: (err: unknown) => subscriber.error(err),
                });

            this.wsService.send({ type: 'meetingConnect', data: { meetingId } });

            return sub;
        });
    }

    observePeers(meetingId: string): Observable<WsSession[]> {
        return new Observable<WsSession[]>((subscriber) => {
            const sub = this.wsService
                .ofType('meetingPeers')
                .pipe(filter((message) => message.data.meetingId === meetingId))
                .subscribe((value) => subscriber.next(value.data.peers));

            this.wsService.send({ type: 'meetingGetPeers', data: { meetingId } });

            return sub;
        });
    }
}
