import { MeetingRepository } from '@server/repositories/meeting.repository';
import { Meeting } from '@shared/models/meeting';

class MeetingService {
    create(): Promise<Meeting> {
        return MeetingRepository.create();
    }
    close(id: string): Promise<void> {
        return MeetingRepository.close(id);
    }
    get(id: string): Promise<Meeting> {
        return MeetingRepository.get(id);
    }
    async join(meetingId: string, userId: number): Promise<void> {
        await MeetingRepository.join(meetingId, userId);
    }
}

const instance = new MeetingService();

export { instance as MeetingService };
