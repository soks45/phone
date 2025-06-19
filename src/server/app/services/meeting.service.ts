import { MeetingSession } from '@server/app/models/meeting-session';
import { ServerWsSession } from '@server/app/models/server-ws-session';
import { MeetingRepository } from '@server/repositories/meeting.repository';
import { AppException } from '@shared/exceptions/app.exception';
import { Meeting } from '@shared/models/meeting';
import { MeetingMessage } from '@shared/models/meeting-message';
import { MeetingData } from '@shared/models/meeting.data';
import { User } from '@shared/models/user';

class MeetingService {
    private readonly meetings: Map<string, MeetingSession> = new Map();

    async close(meetingId: string): Promise<void> {
        const meeting = this.getOrCreateMeeting(meetingId);
        meeting.close();
        this.meetings.delete(meetingId);
        return MeetingRepository.close(meetingId);
    }

    register(wsSession: ServerWsSession): void {
        wsSession.message('meetingConnect').subscribe((message) => {
            this.join(message.data.meetingId, wsSession);
        });
        wsSession.send({ type: 'wsReady', data: true });
    }

    async join(meetingId: string, wsSession: ServerWsSession): Promise<void> {
        await this.assertMeetingIsCreatedAndActive(meetingId);
        await MeetingRepository.join(meetingId, wsSession.userId);
        const meeting: MeetingSession = this.getOrCreateMeeting(meetingId);
        meeting.connect(wsSession);
    }

    private getOrCreateMeeting(meetingId: string): MeetingSession {
        const meeting = this.meetings.get(meetingId) ?? new MeetingSession(meetingId);
        this.meetings.set(meetingId, meeting);
        return meeting;
    }

    private async assertMeetingIsCreatedAndActive(id: string): Promise<void> {
        const exists = MeetingRepository.exists(id);
        if (!exists) throw new AppException(`[MeetingService] Meeting not found: ${id}`);
    }

    create(data: MeetingData): Promise<Meeting> {
        return MeetingRepository.create(data);
    }

    get(meetingId: string): Promise<Meeting> {
        return MeetingRepository.get(meetingId);
    }

    async getParticipants(meetingId: string): Promise<User[]> {
        await this.assertMeetingIsCreatedAndActive(meetingId);
        return MeetingRepository.participants(meetingId);
    }

    chatMessages(meetingId: string): Promise<MeetingMessage[]> {
        return MeetingRepository.getMessages(meetingId);
    }
}

const instance = new MeetingService();

export { instance as MeetingService };
